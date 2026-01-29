'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface Column<RowData extends object = Record<string, unknown>> {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  minWidth?: number;
  format?: (value: RowData[keyof RowData] | undefined, row: RowData) => React.ReactNode;
}

interface DataTableProps<RowData extends object = Record<string, unknown>> {
  columns: Column<RowData>[];
  rows: RowData[];
  page?: number;
  rowsPerPage?: number;
  totalRows?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export default function DataTable<RowData extends object>({
  columns,
  rows,
  page = 0,
  rowsPerPage = 10,
  totalRows = 0,
  onPageChange,
  onRowsPerPageChange,
  loading = false,
  emptyMessage,
}: DataTableProps<RowData>) {
  const { t } = useTranslation('common');

  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange?.(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange?.(parseInt(event.target.value, 10));
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: { xs: 'calc(100vh - 300px)', sm: 600 } }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                  sx={{
                    fontWeight: 600,
                    bgcolor: 'grey.50',
                    color: 'grey.700',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                  <Typography color="text.secondary">{emptyMessage || t('common.noData')}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow
                  hover
                  key={(row as { id?: React.Key })?.id ?? index}
                  sx={{ '&:last-child td': { border: 0 } }}
                >
                  {columns.map((column) => {
                    const value = (row as Record<string, unknown>)[
                      column.id as string
                    ] as RowData[keyof RowData] | undefined;
                    const displayValue = column.format
                      ? column.format(value, row)
                      : (value as React.ReactNode);
                    return (
                      <TableCell 
                        key={column.id} 
                        align={column.align || 'left'}
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        {displayValue}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {totalRows > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalRows}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: 1,
            borderColor: 'grey.100',
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            },
          }}
        />
      )}
    </Paper>
  );
}
