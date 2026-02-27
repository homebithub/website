import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PurpleCard } from '../PurpleCard';

describe('PurpleCard Component', () => {
  describe('Basic Rendering', () => {
    it('renders children content', () => {
      render(<PurpleCard>Test Content</PurpleCard>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders with complex children', () => {
      render(
        <PurpleCard>
          <h1>Title</h1>
          <p>Description</p>
        </PurpleCard>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('renders with React components as children', () => {
      const CustomComponent = () => <div>Custom Component</div>;
      render(
        <PurpleCard>
          <CustomComponent />
        </PurpleCard>
      );
      expect(screen.getByText('Custom Component')).toBeInTheDocument();
    });

    it('renders empty children', () => {
      const { container } = render(<PurpleCard>{null}</PurpleCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toBeInTheDocument();
      expect(card.textContent).toBe('');
    });
  });

  describe('Base Styling', () => {
    it('applies base classes', () => {
      const { container } = render(<PurpleCard>Content</PurpleCard>);
      const card = container.firstChild as HTMLElement;
      
      expect(card).toHaveClass('rounded-2xl');
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('dark:bg-[#13131a]');
    });

    it('applies shadow classes', () => {
      const { container } = render(<PurpleCard>Content</PurpleCard>);
      const card = container.firstChild as HTMLElement;
      
      expect(card).toHaveClass('shadow-light-glow-md');
      expect(card).toHaveClass('dark:shadow-glow-md');
    });

    it('applies border classes', () => {
      const { container } = render(<PurpleCard>Content</PurpleCard>);
      const card = container.firstChild as HTMLElement;
      
      expect(card).toHaveClass('border-2');
      expect(card).toHaveClass('border-purple-200');
      expect(card).toHaveClass('dark:border-purple-500/30');
    });

    it('applies transition classes', () => {
      const { container } = render(<PurpleCard>Content</PurpleCard>);
      const card = container.firstChild as HTMLElement;
      
      expect(card).toHaveClass('transition-colors');
      expect(card).toHaveClass('duration-300');
    });
  });

  describe('Custom ClassName', () => {
    it('applies custom className', () => {
      const { container } = render(<PurpleCard className="custom-class">Content</PurpleCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-class');
    });

    it('preserves base classes when custom className is added', () => {
      const { container } = render(<PurpleCard className="custom-class">Content</PurpleCard>);
      const card = container.firstChild as HTMLElement;
      
      expect(card).toHaveClass('custom-class');
      expect(card).toHaveClass('rounded-2xl');
      expect(card).toHaveClass('bg-white');
    });

    it('applies multiple custom classes', () => {
      const { container } = render(<PurpleCard className="class-1 class-2 class-3">Content</PurpleCard>);
      const card = container.firstChild as HTMLElement;
      
      expect(card).toHaveClass('class-1');
      expect(card).toHaveClass('class-2');
      expect(card).toHaveClass('class-3');
    });

    it('works with empty className', () => {
      const { container } = render(<PurpleCard className="">Content</PurpleCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('rounded-2xl');
    });
  });

  describe('Hover Prop', () => {
    it('applies hover classes by default', () => {
      const { container } = render(<PurpleCard>Content</PurpleCard>);
      const card = container.firstChild as HTMLElement;
      
      expect(card).toHaveClass('transition-transform');
      expect(card).toHaveClass('duration-300');
      expect(card).toHaveClass('hover:-translate-y-2');
      expect(card).toHaveClass('hover:scale-105');
    });

    it('applies hover shadow classes by default', () => {
      const { container } = render(<PurpleCard>Content</PurpleCard>);
      const card = container.firstChild as HTMLElement;
      
      expect(card).toHaveClass('hover:shadow-light-glow-lg');
      expect(card).toHaveClass('dark:hover:shadow-glow-lg');
    });

    it('applies hover classes when hover is true', () => {
      const { container } = render(<PurpleCard hover={true}>Content</PurpleCard>);
      const card = container.firstChild as HTMLElement;
      
      expect(card).toHaveClass('hover:-translate-y-2');
      expect(card).toHaveClass('hover:scale-105');
    });

    it('does not apply hover classes when hover is false', () => {
      const { container } = render(<PurpleCard hover={false}>Content</PurpleCard>);
      const card = container.firstChild as HTMLElement;
      
      expect(card).not.toHaveClass('hover:-translate-y-2');
      expect(card).not.toHaveClass('hover:scale-105');
      expect(card).not.toHaveClass('transition-transform');
    });

    it('does not apply hover shadow when hover is false', () => {
      const { container } = render(<PurpleCard hover={false}>Content</PurpleCard>);
      const card = container.firstChild as HTMLElement;
      
      expect(card).not.toHaveClass('hover:shadow-light-glow-lg');
      expect(card).not.toHaveClass('dark:hover:shadow-glow-lg');
    });
  });

  describe('Glow Prop', () => {
    it('does not apply glow classes by default', () => {
      const { container } = render(<PurpleCard>Content</PurpleCard>);
      const card = container.firstChild as HTMLElement;
      
      expect(card).not.toHaveClass('glow-purple');
      expect(card).not.toHaveClass('shadow-light-glow-sm');
      expect(card).not.toHaveClass('dark:shadow-glow-sm');
    });

    it('applies glow classes when glow is true', () => {
      const { container } = render(<PurpleCard glow={true}>Content</PurpleCard>);
      const card = container.firstChild as HTMLElement;
      
      expect(card).toHaveClass('glow-purple');
      expect(card).toHaveClass('shadow-light-glow-sm');
      expect(card).toHaveClass('dark:shadow-glow-sm');
    });

    it('does not apply glow classes when glow is false', () => {
      const { container } = render(<PurpleCard glow={false}>Content</PurpleCard>);
      const card = container.firstChild as HTMLElement;
      
      expect(card).not.toHaveClass('glow-purple');
      expect(card).not.toHaveClass('shadow-light-glow-sm');
      expect(card).not.toHaveClass('dark:shadow-glow-sm');
    });
  });

  describe('Animate Prop', () => {
    it('does not apply animate classes by default', () => {
      const { container } = render(<PurpleCard>Content</PurpleCard>);
      const card = container.firstChild as HTMLElement;
      
      expect(card).not.toHaveClass('animate-fadeIn');
    });

    it('applies animate classes when animate is true', () => {
      const { container } = render(<PurpleCard animate={true}>Content</PurpleCard>);
      const card = container.firstChild as HTMLElement;
      
      expect(card).toHaveClass('animate-fadeIn');
    });

    it('does not apply animate classes when animate is false', () => {
      const { container } = render(<PurpleCard animate={false}>Content</PurpleCard>);
      const card = container.firstChild as HTMLElement;
      
      expect(card).not.toHaveClass('animate-fadeIn');
    });
  });

  describe('Combined Props', () => {
    it('applies all props when all are true', () => {
      const { container } = render(
        <PurpleCard hover={true} glow={true} animate={true} className="custom">
          Content
        </PurpleCard>
      );
      const card = container.firstChild as HTMLElement;
      
      expect(card).toHaveClass('hover:-translate-y-2');
      expect(card).toHaveClass('glow-purple');
      expect(card).toHaveClass('animate-fadeIn');
      expect(card).toHaveClass('custom');
    });

    it('applies only glow and animate when hover is false', () => {
      const { container } = render(
        <PurpleCard hover={false} glow={true} animate={true}>
          Content
        </PurpleCard>
      );
      const card = container.firstChild as HTMLElement;
      
      expect(card).not.toHaveClass('hover:-translate-y-2');
      expect(card).toHaveClass('glow-purple');
      expect(card).toHaveClass('animate-fadeIn');
    });

    it('applies only hover and animate when glow is false', () => {
      const { container } = render(
        <PurpleCard hover={true} glow={false} animate={true}>
          Content
        </PurpleCard>
      );
      const card = container.firstChild as HTMLElement;
      
      expect(card).toHaveClass('hover:-translate-y-2');
      expect(card).not.toHaveClass('glow-purple');
      expect(card).toHaveClass('animate-fadeIn');
    });

    it('applies only hover and glow when animate is false', () => {
      const { container } = render(
        <PurpleCard hover={true} glow={true} animate={false}>
          Content
        </PurpleCard>
      );
      const card = container.firstChild as HTMLElement;
      
      expect(card).toHaveClass('hover:-translate-y-2');
      expect(card).toHaveClass('glow-purple');
      expect(card).not.toHaveClass('animate-fadeIn');
    });

    it('applies no optional classes when all props are false', () => {
      const { container } = render(
        <PurpleCard hover={false} glow={false} animate={false}>
          Content
        </PurpleCard>
      );
      const card = container.firstChild as HTMLElement;
      
      expect(card).not.toHaveClass('hover:-translate-y-2');
      expect(card).not.toHaveClass('glow-purple');
      expect(card).not.toHaveClass('animate-fadeIn');
      
      // But still has base classes
      expect(card).toHaveClass('rounded-2xl');
      expect(card).toHaveClass('bg-white');
    });
  });

  describe('HTML Structure', () => {
    it('renders as a div element', () => {
      const { container } = render(<PurpleCard>Content</PurpleCard>);
      const card = container.firstChild as HTMLElement;
      expect(card.tagName).toBe('DIV');
    });

    it('contains children within the div', () => {
      const { container } = render(
        <PurpleCard>
          <span data-testid="child">Child Element</span>
        </PurpleCard>
      );
      const card = container.firstChild as HTMLElement;
      const child = screen.getByTestId('child');
      expect(card).toContainElement(child);
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined className gracefully', () => {
      const { container } = render(<PurpleCard className={undefined}>Content</PurpleCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('rounded-2xl');
    });

    it('handles numeric children', () => {
      render(<PurpleCard>{42}</PurpleCard>);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('handles boolean children (renders nothing)', () => {
      const { container } = render(<PurpleCard>{true}</PurpleCard>);
      const card = container.firstChild as HTMLElement;
      expect(card.textContent).toBe('');
    });

    it('handles array of children', () => {
      render(
        <PurpleCard>
          {['Item 1', 'Item 2', 'Item 3'].map((item, i) => (
            <div key={i}>{item}</div>
          ))}
        </PurpleCard>
      );
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('handles fragments as children', () => {
      render(
        <PurpleCard>
          <>
            <span>Fragment Child 1</span>
            <span>Fragment Child 2</span>
          </>
        </PurpleCard>
      );
      expect(screen.getByText('Fragment Child 1')).toBeInTheDocument();
      expect(screen.getByText('Fragment Child 2')).toBeInTheDocument();
    });
  });
});
