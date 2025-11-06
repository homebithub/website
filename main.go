package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	clientDir := "build/client"
	publicDir := "public"

	mux := http.NewServeMux()

	// Health check
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	})

	// Serve immutable assets with long cache
	mux.Handle("/assets/", cacheControl(http.StripPrefix("/assets/", http.FileServer(http.Dir(filepath.Join(clientDir, "assets")))), "no-store"))

	// SPA handler for everything else
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Clean path to avoid traversal
		p := filepath.Clean(r.URL.Path)
		if p == "/" {
			p = "/index.html"
		}

		// Try client build first
		clientPath := filepath.Join(clientDir, strings.TrimPrefix(p, "/"))
		if fileExists(clientPath) && !isDir(clientPath) {
			setCacheControl(w, "no-store")
			http.ServeFile(w, r, clientPath)
			return
		}

		// Then try public directory
		publicPath := filepath.Join(publicDir, strings.TrimPrefix(p, "/"))
		if fileExists(publicPath) && !isDir(publicPath) {
			setCacheControl(w, "no-store")
			http.ServeFile(w, r, publicPath)
			return
		}

		// Fallback to index.html for SPA routing
		indexPath := filepath.Join(clientDir, "index.html")
		setCacheControl(w, "no-store")
		http.ServeFile(w, r, indexPath)
	})

	addr := ":" + port
	log.Printf("Website static server listening on %s\n", addr)
	if err := http.ListenAndServe(addr, withCommonHeaders(mux)); err != nil {
		log.Fatalf("server error: %v", err)
	}
}

func cacheControl(h http.Handler, value string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		setCacheControl(w, value)
		h.ServeHTTP(w, r)
	})
}

func withCommonHeaders(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Server", "homebit-go-static")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		h.ServeHTTP(w, r)
	})
}

func setCacheControl(w http.ResponseWriter, v string) {
	w.Header().Set("Cache-Control", v)
	if v == "no-store" {
		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Expires", "0")
	}
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

func isDir(path string) bool {
	fi, err := os.Stat(path)
	if err != nil {
		return false
	}
	return fi.IsDir()
}
