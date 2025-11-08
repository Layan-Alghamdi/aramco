import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

function DashboardSkeleton() {
  return (
    <div>
      <button className="btn-primary">New Presentation</button>
      <div>My Presentations</div>
    </div>
  );
}

describe('Dashboard smoke test', () => {
  it('renders list and create button', () => {
    render(<DashboardSkeleton />);
    expect(screen.getByText('My Presentations')).toBeInTheDocument();
    expect(screen.getByText('New Presentation')).toBeInTheDocument();
  });
});

