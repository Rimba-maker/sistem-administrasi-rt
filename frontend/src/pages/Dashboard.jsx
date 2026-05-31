import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { formatCurrency } from '../lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Dashboard() {
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
    const [paymentsPage, setPaymentsPage] = useState(1);
    const [expensesPage, setExpensesPage] = useState(1);
    const ITEMS_PER_PAGE = 5;
    const { data: summaryData, isLoading: isLoadingSummary } = useQuery({
        queryKey: ['report-summary', year],
        queryFn: async () => {
            const { data } = await api.get(`/reports/summary?year=${year}`);
            return data;
        }
    });

    const { data: detailData, isLoading: isLoadingDetail } = useQuery({
        queryKey: ['report-detail', year, month],
        queryFn: async () => {
            const { data } = await api.get(`/reports/monthly-detail?year=${year}&month=${month}`);
            return data;
        }
    });

    if (isLoadingSummary || isLoadingDetail) return (
        <div className="flex h-[80vh] items-center justify-center space-x-2">
            <div className="h-4 w-4 animate-bounce rounded-full bg-primary" style={{ animationDelay: '-0.3s' }}></div>
            <div className="h-4 w-4 animate-bounce rounded-full bg-primary" style={{ animationDelay: '-0.15s' }}></div>
            <div className="h-4 w-4 animate-bounce rounded-full bg-primary"></div>
        </div>
    );

    const summary = summaryData?.summary || {};
    const chartData = summaryData?.chart_data || [];

    const paidPayments = detailData?.payments?.filter(p => p.status === 'lunas') || [];
    const paginatedPayments = paidPayments.slice((paymentsPage - 1) * ITEMS_PER_PAGE, paymentsPage * ITEMS_PER_PAGE);
    const totalPaymentsPages = Math.ceil(paidPayments.length / ITEMS_PER_PAGE);

    const expensesList = detailData?.expenses || [];
    const paginatedExpenses = expensesList.slice((expensesPage - 1) * ITEMS_PER_PAGE, expensesPage * ITEMS_PER_PAGE);
    const totalExpensesPages = Math.ceil(expensesList.length / ITEMS_PER_PAGE);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm border-border transition-all duration-200 hover:shadow-md hover:border-foreground/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Rumah</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tighter">{summary.total_houses || 0}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-border transition-all duration-200 hover:shadow-md hover:border-foreground/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Iuran Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tighter text-destructive">{summary.pending_payments || 0}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-border transition-all duration-200 hover:shadow-md hover:border-foreground/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pemasukan ({year})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tighter text-[#0070f3]">{formatCurrency(summary.year_income)}</div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-border transition-all duration-200 hover:shadow-md hover:border-foreground/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Saldo RT</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold tracking-tighter">{formatCurrency(summary.total_saldo_rt)}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-4 shadow-sm border-border">
                <CardHeader>
                    <CardTitle>Pemasukan vs Pengeluaran ({year})</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="w-full overflow-x-auto">
                        <div className="min-w-[700px] h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ebebeb" />
                                    <XAxis dataKey="bulan" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Legend />
                                    <Bar dataKey="pemasukan" fill="#0070f3" name="Pemasukan" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="pengeluaran" fill="#171717" name="Pengeluaran" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="col-span-4 shadow-sm border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Detail Laporan Bulanan</CardTitle>
                    <div className="flex space-x-2">
                        <Select value={month} onValueChange={(val) => { setMonth(val); setPaymentsPage(1); setExpensesPage(1); }}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Bulan" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                    <SelectItem key={m} value={m.toString()}>Bulan {m}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={year} onValueChange={(val) => { setYear(val); setPaymentsPage(1); setExpensesPage(1); }}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                {[2023, 2024, 2025, 2026].map(y => (
                                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {detailData && (
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-4">Pemasukan Lunas: <span className="text-foreground font-semibold">{formatCurrency(detailData.total_pemasukan_lunas)}</span></h3>
                                <div className="space-y-2">
                                    {paginatedPayments.map(p => (
                                        <div key={p.id} className="flex justify-between border-b border-border py-2 text-sm">
                                            <span className="font-medium text-foreground">Rumah {p.house?.nomor_rumah} <span className="text-muted-foreground font-normal ml-2">{p.jenis}</span></span>
                                            <span className="text-[#0070f3]">+{formatCurrency(p.jumlah)}</span>
                                        </div>
                                    ))}
                                    {paginatedPayments.length === 0 && <div className="text-muted-foreground text-sm py-2">Belum ada pemasukan.</div>}
                                </div>
                                {totalPaymentsPages > 1 && (
                                    <div className="flex items-center justify-between mt-4 border-t border-border pt-4">
                                        <Button variant="outline" size="sm" disabled={paymentsPage === 1} onClick={() => setPaymentsPage(p => Math.max(1, p - 1))}>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <span className="text-xs text-muted-foreground">Hal {paymentsPage} dari {totalPaymentsPages}</span>
                                        <Button variant="outline" size="sm" disabled={paymentsPage === totalPaymentsPages} onClick={() => setPaymentsPage(p => Math.min(totalPaymentsPages, p + 1))}>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-4">Pengeluaran: <span className="text-foreground font-semibold">{formatCurrency(detailData.total_pengeluaran)}</span></h3>
                                <div className="space-y-2">
                                    {paginatedExpenses.map(e => (
                                        <div key={e.id} className="flex justify-between border-b border-border py-2 text-sm">
                                            <span className="font-medium text-foreground">{e.nama}</span>
                                            <span className="text-foreground font-semibold">-{formatCurrency(e.jumlah)}</span>
                                        </div>
                                    ))}
                                    {paginatedExpenses.length === 0 && <div className="text-muted-foreground text-sm py-2">Belum ada pengeluaran.</div>}
                                </div>
                                {totalExpensesPages > 1 && (
                                    <div className="flex items-center justify-between mt-4 border-t border-border pt-4">
                                        <Button variant="outline" size="sm" disabled={expensesPage === 1} onClick={() => setExpensesPage(p => Math.max(1, p - 1))}>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <span className="text-xs text-muted-foreground">Hal {expensesPage} dari {totalExpensesPages}</span>
                                        <Button variant="outline" size="sm" disabled={expensesPage === totalExpensesPages} onClick={() => setExpensesPage(p => Math.min(totalExpensesPages, p + 1))}>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}