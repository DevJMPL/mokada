import type { ReactNode } from 'react';

interface IconButtonProps {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}

export const IconButton = ({ title, onClick, disabled, children }: IconButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={title}
    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-[#424245] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
  >
    {children}
  </button>
);
