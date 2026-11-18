'use client';

import { useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { moderateClinicReviews } from '@/lib/actions/moderate-reviews';

import type { DashboardReview } from '@/helpers/reviews';

import { Checkbox } from '@/components/form-fields/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/ui/star-rating';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';

const submittedDateFormatter = new Intl.DateTimeFormat('en-MY', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Kuala_Lumpur',
});

function formatSubmittedAt(value: string | null) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return submittedDateFormatter.format(date);
}

function statusVariant(status: string | null): 'yellow' | 'green' | 'red' | 'gray' {
  if (status === 'pending') return 'yellow';
  if (status === 'approved') return 'green';
  if (status === 'rejected' || status === 'clinic_rejected') return 'red';
  return 'gray';
}

function statusLabel(status: string | null) {
  if (!status) return 'Unknown';
  return status.replace(/_/g, ' ');
}

export function ReviewModerationTable({ reviews }: { reviews: DashboardReview[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allSelected = reviews.length > 0 && selectedIds.length === reviews.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? reviews.map((review) => review.id) : []);
  };

  const toggleOne = (reviewId: string, checked: boolean) => {
    setSelectedIds((current) => {
      if (checked) {
        return current.includes(reviewId) ? current : [...current, reviewId];
      }

      return current.filter((id) => id !== reviewId);
    });
  };

  const moderate = (reviewIds: string[], status: 'approved' | 'rejected') => {
    startTransition(async () => {
      const result = await moderateClinicReviews(reviewIds, status);

      if (!result.ok) {
        toast({
          variant: 'destructive',
          title: 'Could not update reviews',
          description: result.error,
        });
        return;
      }

      const noun = result.updated === 1 ? 'review' : 'reviews';
      toast({
        title:
          result.updated === 0
            ? 'Those reviews were already up to date'
            : status === 'approved'
              ? `Approved ${result.updated} ${noun}`
              : `Rejected ${result.updated} ${noun}`,
      });
      setSelectedIds([]);
      router.refresh();
    });
  };

  if (reviews.length === 0) {
    return (
      <p className="rounded-md border border-gray-200 bg-white px-4 py-8 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
        No reviews in this filter.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="primary"
          className="px-3 py-2 text-sm"
          disabled={isPending || selectedIds.length === 0}
          onClick={() => moderate(selectedIds, 'approved')}>
          Approve selected
        </Button>
        <Button
          type="button"
          variant="danger"
          className="px-3 py-2 text-sm"
          disabled={isPending || selectedIds.length === 0}
          onClick={() => moderate(selectedIds, 'rejected')}>
          Reject selected
        </Button>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {selectedIds.length} selected
        </span>
      </div>

      <div className="rounded-md border border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                  onCheckedChange={(value) => toggleAll(value === true)}
                  aria-label="Select all reviews on this page"
                  disabled={isPending}
                />
              </TableHead>
              <TableHead>Clinic</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id} data-state={selectedIds.includes(review.id) && 'selected'}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(review.id)}
                    onCheckedChange={(value) => toggleOne(review.id, value === true)}
                    aria-label={`Select review by ${review.authorName}`}
                    disabled={isPending}
                  />
                </TableCell>
                <TableCell className="max-w-[220px] align-top">
                  {review.clinic ? (
                    <a
                      href={`/place/${review.clinic.slug}`}
                      className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                      {review.clinic.name}
                    </a>
                  ) : (
                    <span className="text-gray-500">Unknown clinic</span>
                  )}
                </TableCell>
                <TableCell className="align-top">
                  <span className="block font-medium text-gray-900 dark:text-gray-100">
                    {review.authorName}
                  </span>
                  <span className="block text-gray-500 dark:text-gray-400">
                    {review.email ?? '—'}
                  </span>
                </TableCell>
                <TableCell className="align-top">
                  <StarRating rating={review.rating} showValue={false} />
                </TableCell>
                <TableCell className="max-w-md align-top">
                  <p className="line-clamp-4 whitespace-pre-wrap text-gray-700 dark:text-gray-200">
                    {review.text || '—'}
                  </p>
                </TableCell>
                <TableCell className="whitespace-nowrap align-top text-gray-600 dark:text-gray-300">
                  {formatSubmittedAt(review.submittedAt)}
                </TableCell>
                <TableCell className="align-top capitalize text-gray-600 dark:text-gray-300">
                  {review.source ?? '—'}
                </TableCell>
                <TableCell className="align-top">
                  <Badge variant={statusVariant(review.status)}>{statusLabel(review.status)}</Badge>
                </TableCell>
                <TableCell className="align-top">
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="primary"
                      className="px-3 py-2 text-sm"
                      disabled={isPending || review.status === 'approved'}
                      onClick={() => moderate([review.id], 'approved')}>
                      Approve
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      className="px-3 py-2 text-sm"
                      disabled={isPending || review.status === 'rejected'}
                      onClick={() => moderate([review.id], 'rejected')}>
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
