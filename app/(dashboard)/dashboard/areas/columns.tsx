'use client';

import Image from 'next/image';
import Link from 'next/link';

import { ClinicArea } from '@/types/clinic';
import { ColumnDef } from '@tanstack/react-table';

import { absoluteUrl } from '@/lib/utils';

import { Checkbox } from '@/components/form-fields/checkbox';

import { DataTableColumnHeader } from './components/data-table-column-header';
import { DataTableRowActions } from './components/data-table-row-actions';

export type AreaTableData = Partial<ClinicArea>;

export const columns: ColumnDef<AreaTableData>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" className="" />,
    cell: ({ row }) => {
      return (
        <div>
          <span className="block max-w-[500px] truncate">{row.getValue('name')}</span>
          <span className="block max-w-[500px] truncate italic">{row.original.slug}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const stateSlug = row.getValue('state') as string;
      return value.includes(stateSlug);
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'state',
    accessorFn: (row) => row.states?.name,
    header: ({ column }) => <DataTableColumnHeader column={column} title="State" className="" />,
    cell: ({ row }) => {
      return row.getValue('state');
    },
    filterFn: (row, id, value) => {
      const stateSlug = row.getValue('state') as string;
      return value.includes(stateSlug);
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'clinic',
    accessorFn: (row) => row.clinics?.[0]?.count,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Clinics" className="" />,
    cell: ({ row }) => {
      const clinicsCount = row.getValue('clinic') as number;
      return (
        <div>
          <span>{clinicsCount || 0} clinics</span>
        </div>
      );
    },
    filterFn: (row) => {
      const clinicsCount = row.getValue('clinic') as number;
      return clinicsCount > 0;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'thumbnail_image',
    header: ({ column }) => <DataTableColumnHeader column={column} title="📸" className="" />,
    cell: ({ row }) => {
      const thumbnailImage = row.getValue('thumbnail_image') as string | undefined;
      return (
        <div>
          {thumbnailImage ? (
            <Image unoptimized src={thumbnailImage} alt="Thumbnail" width={100} height={100} />
          ) : (
            '-'
          )}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'banner_image',
    header: ({ column }) => <DataTableColumnHeader column={column} title="📸" className="" />,
    cell: ({ row }) => {
      const bannerImage = row.getValue('banner_image') as string | undefined;
      return (
        <div>
          {bannerImage ? (
            <Image unoptimized src={bannerImage} alt="Banner" width={100} height={100} />
          ) : (
            '-'
          )}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: 'preview',
    header: ({ column }) => <DataTableColumnHeader column={column} title="🌍" className="" />,
    cell: ({ row }) => (
      <div>
        <div className="flex gap-4">
          <Link href={absoluteUrl(`/place/${row.original.slug}`)} target="_blank">
            Dev
          </Link>
          <Link
            href={`https://www.dentalclinicclosetome.my/place/${row.original.slug}`}
            target="_blank"
            className="ml-4">
            Prod
          </Link>
        </div>
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
