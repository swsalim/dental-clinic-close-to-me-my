'use client';

import Link from 'next/link';

import { Row } from '@tanstack/react-table';
import { PencilSimple as PencilIcon } from '@phosphor-icons/react/dist/ssr';

import { cn } from '@/lib/utils';

import { buttonVariants } from '@/components/ui/button';

import { StateTableData } from '../columns';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData extends StateTableData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const state = row.original;

  return (
    <>
      <Link
        className={cn(buttonVariants({ variant: 'outline' }))}
        href={`/dashboard/states/edit/${state.id}`}>
        <PencilIcon weight="duotone" className="mr-2 h-4 w-4" />
        Edit
      </Link>
    </>
  );
}
