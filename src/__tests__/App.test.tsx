import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

function createMockToken(): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    userId: 'test-user-id',
    role: 'talent',
    status: 'active',
    exp: Math.floor(Date.now() / 1000) + 86400,
  }));
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
}

describe('App', () => {
  beforeEach(() => {
    localStorage.setItem('auth_token', createMockToken());
    localStorage.setItem('auth_user', JSON.stringify({
      id: 'test-user-id',
      email: 'test@example.com',
      fullName: 'Test Talent',
      role: 'talent',
      status: 'active',
    }));
  });

  it('renders the branding', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    const brandTexts = screen.getAllByText((_, el) => el?.textContent === 'SinergiAtlet');
    expect(brandTexts.length).toBeGreaterThan(0);
  });

  it('renders bottom navigation for talent', () => {
    render(
      <MemoryRouter initialEntries={['/market']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText('Market')).toBeInTheDocument();
    expect(screen.getByText('Career')).toBeInTheDocument();
    expect(screen.getByText('KYS')).toBeInTheDocument();
  });
});
