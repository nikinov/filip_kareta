// Unit tests for UI components
// Tests for reusable UI components and their functionality

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

describe('UI Components', () => {
  describe('Button Component', () => {
    it('renders with default props', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-primary');
    });

    it('handles click events', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button', { name: /click me/i });
      await userEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies variant classes correctly', () => {
      const { rerender } = render(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole('button')).toHaveClass('border-input');

      rerender(<Button variant="destructive">Destructive</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-destructive');

      rerender(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole('button')).toHaveClass('hover:bg-accent');
    });

    it('applies size classes correctly', () => {
      const { rerender } = render(<Button size="sm">Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-9');

      rerender(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-11');
    });

    it('disables button when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:pointer-events-none');
    });

    it('shows loading state', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Card Component', () => {
    it('renders card with content', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Test content</p>
          </CardContent>
        </Card>
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Card className="custom-class">Content</Card>);
      const card = screen.getByText('Content').closest('div');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('Input Component', () => {
    it('renders input with placeholder', () => {
      render(<Input placeholder="Enter text" />);
      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toBeInTheDocument();
    });

    it('handles value changes', async () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'test value');
      
      expect(handleChange).toHaveBeenCalled();
      expect(input).toHaveValue('test value');
    });

    it('applies error styles when invalid', () => {
      render(<Input className="border-destructive" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-destructive');
    });

    it('supports different input types', () => {
      const { rerender } = render(<Input type="email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

      rerender(<Input type="password" />);
      expect(screen.getByLabelText(/password/i) || screen.getByDisplayValue('')).toHaveAttribute('type', 'password');
    });
  });

  describe('Checkbox Component', () => {
    it('renders checkbox', () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('handles checked state', async () => {
      const handleChange = jest.fn();
      render(<Checkbox onCheckedChange={handleChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      await userEvent.click(checkbox);
      
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('can be disabled', () => {
      render(<Checkbox disabled />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
    });

    it('supports indeterminate state', () => {
      render(<Checkbox checked="indeterminate" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'indeterminate');
    });
  });

  describe('Badge Component', () => {
    it('renders badge with text', () => {
      render(<Badge>New</Badge>);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('applies variant classes', () => {
      const { rerender } = render(<Badge variant="secondary">Secondary</Badge>);
      expect(screen.getByText('Secondary')).toHaveClass('bg-secondary');

      rerender(<Badge variant="destructive">Destructive</Badge>);
      expect(screen.getByText('Destructive')).toHaveClass('bg-destructive');

      rerender(<Badge variant="outline">Outline</Badge>);
      expect(screen.getByText('Outline')).toHaveClass('border');
    });
  });

  describe('Progress Component', () => {
    it('renders progress bar', () => {
      render(<Progress value={50} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    });

    it('handles different progress values', () => {
      const { rerender } = render(<Progress value={0} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');

      rerender(<Progress value={100} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    });

    it('applies custom className', () => {
      render(<Progress value={50} className="custom-progress" />);
      const progress = screen.getByRole('progressbar');
      expect(progress).toHaveClass('custom-progress');
    });
  });

  describe('Accessibility', () => {
    it('button has proper ARIA attributes', () => {
      render(<Button aria-label="Custom label">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
    });

    it('input supports ARIA attributes', () => {
      render(
        <div>
          <label htmlFor="test-input">Test Label</label>
          <Input id="test-input" aria-describedby="help-text" />
          <div id="help-text">Help text</div>
        </div>
      );
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('checkbox supports labels', () => {
      render(
        <div>
          <Checkbox id="test-checkbox" />
          <label htmlFor="test-checkbox">Test Checkbox</label>
        </div>
      );
      
      const checkbox = screen.getByLabelText('Test Checkbox');
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('button responds to Enter key', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      await userEvent.keyboard('{Enter}');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('button responds to Space key', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      await userEvent.keyboard(' ');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('checkbox responds to Space key', async () => {
      const handleChange = jest.fn();
      render(<Checkbox onCheckedChange={handleChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      await userEvent.keyboard(' ');
      
      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Form Integration', () => {
    it('input works in form context', async () => {
      const handleSubmit = jest.fn((e) => e.preventDefault());
      
      render(
        <form onSubmit={handleSubmit}>
          <Input name="test-input" />
          <Button type="submit">Submit</Button>
        </form>
      );
      
      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /submit/i });
      
      await userEvent.type(input, 'test value');
      await userEvent.click(submitButton);
      
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('checkbox works in form context', async () => {
      const handleSubmit = jest.fn((e) => e.preventDefault());
      
      render(
        <form onSubmit={handleSubmit}>
          <Checkbox name="test-checkbox" />
          <Button type="submit">Submit</Button>
        </form>
      );
      
      const checkbox = screen.getByRole('checkbox');
      const submitButton = screen.getByRole('button', { name: /submit/i });
      
      await userEvent.click(checkbox);
      await userEvent.click(submitButton);
      
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});
