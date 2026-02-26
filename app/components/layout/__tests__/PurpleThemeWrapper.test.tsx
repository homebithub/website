import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PurpleThemeWrapper } from '../PurpleThemeWrapper';

describe('PurpleThemeWrapper Component', () => {
  describe('Basic Rendering', () => {
    it('renders children content', () => {
      render(<PurpleThemeWrapper>Test Content</PurpleThemeWrapper>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('renders with complex children', () => {
      render(
        <PurpleThemeWrapper>
          <h1>Title</h1>
          <p>Description</p>
        </PurpleThemeWrapper>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('renders with React components as children', () => {
      const CustomComponent = () => <div>Custom Component</div>;
      render(
        <PurpleThemeWrapper>
          <CustomComponent />
        </PurpleThemeWrapper>
      );
      expect(screen.getByText('Custom Component')).toBeInTheDocument();
    });

    it('renders empty children', () => {
      const { container } = render(<PurpleThemeWrapper>{null}</PurpleThemeWrapper>);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      render(
        <PurpleThemeWrapper>
          <div>First Child</div>
          <div>Second Child</div>
          <div>Third Child</div>
        </PurpleThemeWrapper>
      );
      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
      expect(screen.getByText('Third Child')).toBeInTheDocument();
    });
  });

  describe('Variant Prop - Gradient', () => {
    it('applies gradient variant by default', () => {
      const { container } = render(<PurpleThemeWrapper>Content</PurpleThemeWrapper>);
      const wrapper = container.firstChild as HTMLElement;
      
      expect(wrapper).toHaveClass('bg-gradient-to-br');
      expect(wrapper).toHaveClass('from-purple-100');
      expect(wrapper).toHaveClass('via-white');
      expect(wrapper).toHaveClass('to-purple-200');
    });

    it('applies gradient variant when explicitly set', () => {
      const { container } = render(<PurpleThemeWrapper variant="gradient">Content</PurpleThemeWrapper>);
      const wrapper = container.firstChild as HTMLElement;
      
      expect(wrapper).toHaveClass('bg-gradient-to-br');
      expect(wrapper).toHaveClass('from-purple-100');
      expect(wrapper).toHaveClass('via-white');
      expect(wrapper).toHaveClass('to-purple-200');
    });

    it('applies dark mode gradient classes', () => {
      const { container } = render(<PurpleThemeWrapper variant="gradient">Content</PurpleThemeWrapper>);
      const wrapper = container.firstChild as HTMLElement;
      
      expect(wrapper).toHaveClass('dark:from-[#0a0a0f]');
      expect(wrapper).toHaveClass('dark:via-[#13131a]');
      expect(wrapper).toHaveClass('dark:to-[#0a0a0f]');
    });
  });

  describe('Variant Prop - Light', () => {
    it('applies light variant classes', () => {
      const { container } = render(<PurpleThemeWrapper variant="light">Content</PurpleThemeWrapper>);
      const wrapper = container.firstChild as HTMLElement;
      
      expect(wrapper).toHaveClass('bg-gradient-to-br');
      expect(wrapper).toHaveClass('from-purple-50');
      expect(wrapper).toHaveClass('via-white');
      expect(wrapper).toHaveClass('to-purple-100');
    });

    it('applies light variant dark mode classes', () => {
      const { container } = render(<PurpleThemeWrapper variant="light">Content</PurpleThemeWrapper>);
      const wrapper = container.firstChild as HTMLElement;
      
      expect(wrapper).toHaveClass('dark:from-[#0a0a0f]');
      expect(wrapper).toHaveClass('dark:via-[#0a0a0f]');
      expect(wrapper).toHaveClass('dark:to-[#13131a]');
    });

    it('light variant has lighter colors than gradient', () => {
      const { container: gradientContainer } = render(<PurpleThemeWrapper variant="gradient">Content</PurpleThemeWrapper>);
      const { container: lightContainer } = render(<PurpleThemeWrapper variant="light">Content</PurpleThemeWrapper>);
      
      const gradientWrapper = gradientContainer.firstChild as HTMLElement;
      const lightWrapper = lightContainer.firstChild as HTMLElement;
      
      expect(gradientWrapper).toHaveClass('from-purple-100');
      expect(lightWrapper).toHaveClass('from-purple-50');
    });
  });

  describe('Variant Prop - White', () => {
    it('applies white variant classes', () => {
      const { container } = render(<PurpleThemeWrapper variant="white">Content</PurpleThemeWrapper>);
      const wrapper = container.firstChild as HTMLElement;
      
      expect(wrapper).toHaveClass('bg-white');
      expect(wrapper).toHaveClass('dark:bg-[#0a0a0f]');
    });

    it('white variant does not have gradient classes', () => {
      const { container } = render(<PurpleThemeWrapper variant="white">Content</PurpleThemeWrapper>);
      const wrapper = container.firstChild as HTMLElement;
      
      expect(wrapper).not.toHaveClass('bg-gradient-to-br');
      expect(wrapper).not.toHaveClass('from-purple-100');
      expect(wrapper).not.toHaveClass('via-white');
    });

    it('white variant is solid color', () => {
      const { container } = render(<PurpleThemeWrapper variant="white">Content</PurpleThemeWrapper>);
      const wrapper = container.firstChild as HTMLElement;
      
      expect(wrapper).toHaveClass('bg-white');
    });
  });

  describe('Custom ClassName', () => {
    it('applies custom className', () => {
      const { container } = render(<PurpleThemeWrapper className="custom-class">Content</PurpleThemeWrapper>);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('preserves base classes when custom className is added', () => {
      const { container } = render(<PurpleThemeWrapper className="custom-class">Content</PurpleThemeWrapper>);
      const wrapper = container.firstChild as HTMLElement;
      
      expect(wrapper).toHaveClass('custom-class');
      expect(wrapper).toHaveClass('relative');
      expect(wrapper).toHaveClass('transition-colors');
    });

    it('applies multiple custom classes', () => {
      const { container } = render(<PurpleThemeWrapper className="class-1 class-2 class-3">Content</PurpleThemeWrapper>);
      const wrapper = container.firstChild as HTMLElement;
      
      expect(wrapper).toHaveClass('class-1');
      expect(wrapper).toHaveClass('class-2');
      expect(wrapper).toHaveClass('class-3');
    });

    it('works with empty className', () => {
      const { container } = render(<PurpleThemeWrapper className="">Content</PurpleThemeWrapper>);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('relative');
    });

    it('custom className works with different variants', () => {
      const { container: gradientContainer } = render(<PurpleThemeWrapper variant="gradient" className="custom">Content</PurpleThemeWrapper>);
      const { container: lightContainer } = render(<PurpleThemeWrapper variant="light" className="custom">Content</PurpleThemeWrapper>);
      const { container: whiteContainer } = render(<PurpleThemeWrapper variant="white" className="custom">Content</PurpleThemeWrapper>);
      
      expect(gradientContainer.firstChild).toHaveClass('custom');
      expect(lightContainer.firstChild).toHaveClass('custom');
      expect(whiteContainer.firstChild).toHaveClass('custom');
    });
  });

  describe('Base Styling', () => {
    it('has relative positioning', () => {
      const { container } = render(<PurpleThemeWrapper>Content</PurpleThemeWrapper>);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('relative');
    });

    it('has transition classes', () => {
      const { container } = render(<PurpleThemeWrapper>Content</PurpleThemeWrapper>);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('transition-colors');
      expect(wrapper).toHaveClass('duration-300');
    });

    it('inner div has relative positioning', () => {
      const { container } = render(<PurpleThemeWrapper>Content</PurpleThemeWrapper>);
      const innerDiv = container.querySelector('.relative.z-10');
      expect(innerDiv).toBeInTheDocument();
    });

    it('inner div has z-index', () => {
      const { container } = render(<PurpleThemeWrapper>Content</PurpleThemeWrapper>);
      const innerDiv = container.querySelector('.z-10');
      expect(innerDiv).toBeInTheDocument();
    });

    it('inner div has flex layout', () => {
      const { container } = render(<PurpleThemeWrapper>Content</PurpleThemeWrapper>);
      const innerDiv = container.querySelector('.flex.flex-col');
      expect(innerDiv).toBeInTheDocument();
    });

    it('inner div has height classes', () => {
      const { container } = render(<PurpleThemeWrapper>Content</PurpleThemeWrapper>);
      const innerDiv = container.querySelector('.h-full.min-h-0');
      expect(innerDiv).toBeInTheDocument();
    });
  });

  describe('HTML Structure', () => {
    it('renders as a div element', () => {
      const { container } = render(<PurpleThemeWrapper>Content</PurpleThemeWrapper>);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.tagName).toBe('DIV');
    });

    it('has nested div structure', () => {
      const { container } = render(<PurpleThemeWrapper>Content</PurpleThemeWrapper>);
      const wrapper = container.firstChild as HTMLElement;
      const innerDiv = wrapper.firstChild as HTMLElement;
      
      expect(innerDiv.tagName).toBe('DIV');
    });

    it('children are inside inner div', () => {
      const { container } = render(
        <PurpleThemeWrapper>
          <span data-testid="child">Child Element</span>
        </PurpleThemeWrapper>
      );
      
      const innerDiv = container.querySelector('.z-10');
      const child = screen.getByTestId('child');
      expect(innerDiv).toContainElement(child);
    });

    it('outer div does not directly contain children', () => {
      const { container } = render(
        <PurpleThemeWrapper>
          <span data-testid="child">Child Element</span>
        </PurpleThemeWrapper>
      );
      
      const wrapper = container.firstChild as HTMLElement;
      const child = screen.getByTestId('child');
      
      // Child is in wrapper but not as direct child
      expect(wrapper).toContainElement(child);
      expect(wrapper.children[0]).toContainElement(child);
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined variant gracefully', () => {
      const { container } = render(<PurpleThemeWrapper variant={undefined}>Content</PurpleThemeWrapper>);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('bg-gradient-to-br'); // defaults to gradient
    });

    it('handles undefined className gracefully', () => {
      const { container } = render(<PurpleThemeWrapper className={undefined}>Content</PurpleThemeWrapper>);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('relative');
    });

    it('handles numeric children', () => {
      render(<PurpleThemeWrapper>{42}</PurpleThemeWrapper>);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('handles boolean children (renders nothing)', () => {
      const { container } = render(<PurpleThemeWrapper>{true}</PurpleThemeWrapper>);
      const innerDiv = container.querySelector('.z-10');
      expect(innerDiv?.textContent).toBe('');
    });

    it('handles array of children', () => {
      render(
        <PurpleThemeWrapper>
          {['Item 1', 'Item 2', 'Item 3'].map((item, i) => (
            <div key={i}>{item}</div>
          ))}
        </PurpleThemeWrapper>
      );
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('handles fragments as children', () => {
      render(
        <PurpleThemeWrapper>
          <>
            <span>Fragment Child 1</span>
            <span>Fragment Child 2</span>
          </>
        </PurpleThemeWrapper>
      );
      expect(screen.getByText('Fragment Child 1')).toBeInTheDocument();
      expect(screen.getByText('Fragment Child 2')).toBeInTheDocument();
    });

    it('handles deeply nested children', () => {
      render(
        <PurpleThemeWrapper>
          <div>
            <div>
              <div>
                <span>Deeply Nested</span>
              </div>
            </div>
          </div>
        </PurpleThemeWrapper>
      );
      expect(screen.getByText('Deeply Nested')).toBeInTheDocument();
    });
  });

  describe('Variant Combinations', () => {
    it('gradient variant with custom className', () => {
      const { container } = render(<PurpleThemeWrapper variant="gradient" className="custom">Content</PurpleThemeWrapper>);
      const wrapper = container.firstChild as HTMLElement;
      
      expect(wrapper).toHaveClass('bg-gradient-to-br');
      expect(wrapper).toHaveClass('custom');
    });

    it('light variant with custom className', () => {
      const { container } = render(<PurpleThemeWrapper variant="light" className="custom">Content</PurpleThemeWrapper>);
      const wrapper = container.firstChild as HTMLElement;
      
      expect(wrapper).toHaveClass('from-purple-50');
      expect(wrapper).toHaveClass('custom');
    });

    it('white variant with custom className', () => {
      const { container } = render(<PurpleThemeWrapper variant="white" className="custom">Content</PurpleThemeWrapper>);
      const wrapper = container.firstChild as HTMLElement;
      
      expect(wrapper).toHaveClass('bg-white');
      expect(wrapper).toHaveClass('custom');
    });
  });

  describe('Unused Props (Documentation)', () => {
    // These props are defined in the interface but not used in the implementation
    // Testing that they don't break the component
    
    it('accepts bubbles prop without breaking', () => {
      const { container } = render(<PurpleThemeWrapper bubbles={true}>Content</PurpleThemeWrapper>);
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('accepts bubbles=false prop without breaking', () => {
      const { container } = render(<PurpleThemeWrapper bubbles={false}>Content</PurpleThemeWrapper>);
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('accepts bubbleDensity prop without breaking', () => {
      const { container } = render(<PurpleThemeWrapper bubbleDensity="high">Content</PurpleThemeWrapper>);
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('accepts all bubble props together without breaking', () => {
      const { container } = render(
        <PurpleThemeWrapper bubbles={true} bubbleDensity="low">
          Content
        </PurpleThemeWrapper>
      );
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });
});
