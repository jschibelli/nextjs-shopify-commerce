"use client"

import SessionTracker from 'components/session-tracker';

interface AccountClientWrapperProps {
  children: React.ReactNode;
}

export function AccountClientWrapper({ children }: AccountClientWrapperProps) {
  return (
    <>
      <SessionTracker />
      {children}
    </>
  );
} 