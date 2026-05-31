import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Plus, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '../lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Payments() {
    const queryClient = useQueryClient();
    const [filterHouse, setFilterHouse] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    
    // Modal states
    const [isOpenSingle, setIsOpenSingle] = useState(false);
    const [isOpenBulk, setIsOpenBulk] = useState(false);

    // Forms
    const [singleForm, setSingleForm] = useState({ house_id: '', jenis: 'satpam', bulan: new Date().getMonth() + 1, tahun: new Date().getFullYear(), status: 'belum_lunas' });
    const [bulkForm, setBulkForm] = useState({ house_id: '', tahun: new Date().getFullYear(), status: 'belum_lunas' });

    const { data: payments = [], isLoading } = useQuery({
        queryKey: ['payments', filterHouse, filterStatus],
        queryFn: async () => {
            let url = '/payments?';
            if (filterHouse !== 'all') url += `house_id=${filterHouse}&`;
            if (filterStatus !== 'all') url += `status=${filterStatus}`;
            const { data } = await api.get(url);
            return data;
        }
    });
    const paginatedPayments = payments.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    const totalPages = Math.ceil(payments.length / ITEMS_PER_PAGE);

    const { data: houses = [] } = useQuery({
        queryKey: ['houses'],
        queryFn: async () => {
            const { data } = await api.get('/houses');
            return data.filter(h => h.status === 'dihuni'); // Only show occupied houses for creating payments
        }
    });

    const createSingleMutation = useMutation({
        mutationFn: async () => api.post('/payments', singleForm),
        onSuccess: () => {
            queryClient.invalidateQueries(['payments']);
            setIsOpenSingle(false);
        },
        onError: (err) => alert(err.response?.data?.message || 'Error creating payment')
    });

    const createBulkMutation = useMutation({
        mutationFn: async () => api.post('/payments/bulk-yearly', bulkForm),
        onSuccess: (res) => {
            queryClient.invalidateQueries(['payments']);
            setIsOpenBulk(false);
            alert(`Berhasil: ${res.data?.message || 'Tagihan 1 tahun digenerate.'}`);
        },
        onError: (err) => alert(err.response?.data?.message || 'Error')
    });

    const markPaidMutation = useMutation({
        mutationFn: async (id) => api.patch(`/payments/${id}/mark-paid`),
        onSuccess: () => queryClient.invalidateQueries(['payments'])
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Data Iuran</h2>
                
                <div className="flex space-x-2">
                    <Select value={filterHouse} onValueChange={(val) => { setFilterHouse(val); setPage(1); }}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Filter Rumah" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Rumah</SelectItem>
                            {houses.map(h => (
                                <SelectItem key={h.id} value={h.id.toString()}>{h.nomor_rumah}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filterStatus} onValueChange={(val) => { setFilterStatus(val); setPage(1); }}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="lunas">Lunas</SelectItem>
                            <SelectItem value="belum_lunas">Belum Lunas</SelectItem>
                        </SelectContent>
                    </Select>

                    <Dialog open={isOpenSingle} onOpenChange={setIsOpenSingle}>
                        <DialogTrigger asChild>
                            <Button variant="outline"><Plus className="mr-2" size={16} /> Buat Tagihan</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Buat Tagihan Iuran Manual</DialogTitle></DialogHeader>
                            <form onSubmit={(e) => { e.preventDefault(); createSingleMutation.mutate(); }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Rumah (Hanya yg dihuni)</label>
                                    <Select value={singleForm.house_id} onValueChange={v => setSingleForm({...singleForm, house_id: v})} required>
                                        <SelectTrigger className="w-full"><SelectValue placeholder="Pilih Rumah" /></SelectTrigger>
                                        <SelectContent>
                                            {houses.map(h => (
                                                <SelectItem key={h.id} value={h.id.toString()}>{h.nomor_rumah} - {h.active_resident?.resident?.nama_lengkap}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Jenis Iuran</label>
                                    <Select value={singleForm.jenis} onValueChange={v => setSingleForm({...singleForm, jenis: v})}>
                                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="satpam">Satpam (Rp 100.000)</SelectItem>
                                            <SelectItem value="kebersihan">Kebersihan (Rp 15.000)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Bulan</label>
                                        <input type="number" min="1" max="12" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={singleForm.bulan} onChange={e => setSingleForm({...singleForm, bulan: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Tahun</label>
                                        <input type="number" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={singleForm.tahun} onChange={e => setSingleForm({...singleForm, tahun: e.target.value})} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status Pembayaran</label>
                                    <Select value={singleForm.status} onValueChange={v => setSingleForm({...singleForm, status: v})}>
                                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="belum_lunas">Belum Bayar (Hanya Buat Tagihan)</SelectItem>
                                            <SelectItem value="lunas">Lunas (Sudah Dibayar)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit" className="w-full" disabled={createSingleMutation.isLoading || !singleForm.house_id}>Simpan Tagihan</Button>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isOpenBulk} onOpenChange={setIsOpenBulk}>
                        <DialogTrigger asChild>
                            <Button><Calendar className="mr-2" size={16} /> Generate Iuran 1 Tahun</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Generate Iuran Kebersihan 1 Tahun</DialogTitle></DialogHeader>
                            <form onSubmit={(e) => { e.preventDefault(); createBulkMutation.mutate(); }} className="space-y-4">
                                <div className="bg-muted text-foreground p-3 rounded-md border border-border text-sm">
                                    Akan men-generate <b>12 bulan</b> tagihan iuran Kebersihan secara otomatis (Januari s/d Desember). <br className="mb-1" />
                                    <span className="text-[#0070f3] font-semibold">Total Tagihan: Rp 180.000</span> <span className="text-muted-foreground">(12 x Rp 15.000)</span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Rumah (Hanya yg dihuni)</label>
                                    <Select value={bulkForm.house_id} onValueChange={v => setBulkForm({...bulkForm, house_id: v})} required>
                                        <SelectTrigger className="w-full"><SelectValue placeholder="Pilih Rumah" /></SelectTrigger>
                                        <SelectContent>
                                            {houses.map(h => (
                                                <SelectItem key={h.id} value={h.id.toString()}>{h.nomor_rumah} - {h.active_resident?.resident?.nama_lengkap}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tahun</label>
                                    <input type="number" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={bulkForm.tahun} onChange={e => setBulkForm({...bulkForm, tahun: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status Pembayaran</label>
                                    <Select value={bulkForm.status} onValueChange={v => setBulkForm({...bulkForm, status: v})}>
                                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="belum_lunas">Belum Bayar (Hanya Buat Tagihan)</SelectItem>
                                            <SelectItem value="lunas">Lunas (Sudah Dibayar)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit" className="w-full" disabled={createBulkMutation.isLoading || !bulkForm.house_id}>Generate 1 Tahun</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <Card className="shadow-sm border-border overflow-hidden transition-all duration-200 hover:shadow-md hover:border-foreground/20">
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left min-w-[800px]">
                        <thead className="border-b border-border bg-muted/20">
                            <tr className="text-muted-foreground text-[13px]">
                                <th className="px-6 py-3 font-medium h-10">Bulan/Tahun</th>
                                <th className="px-6 py-3 font-medium h-10">Rumah</th>
                                <th className="px-6 py-3 font-medium h-10">Penghuni</th>
                                <th className="px-6 py-3 font-medium h-10">Jenis</th>
                                <th className="px-6 py-3 font-medium h-10">Jumlah</th>
                                <th className="px-6 py-3 font-medium h-10">Status</th>
                                <th className="px-6 py-3 font-medium h-10 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="7" className="text-center py-12"><div className="flex justify-center space-x-2"><div className="h-4 w-4 animate-bounce rounded-full bg-primary" style={{ animationDelay: '-0.3s' }}></div><div className="h-4 w-4 animate-bounce rounded-full bg-primary" style={{ animationDelay: '-0.15s' }}></div><div className="h-4 w-4 animate-bounce rounded-full bg-primary"></div></div></td></tr>
                            ) : paginatedPayments.map((p) => (
                                <tr key={p.id} className="border-b border-border hover:bg-muted/50 transition-colors last:border-0">
                                    <td className="px-6 py-4 font-semibold text-foreground">{p.bulan}/{p.tahun}</td>
                                    <td className="px-6 py-4 text-foreground">{p.house?.nomor_rumah}</td>
                                    <td className="px-6 py-4 text-foreground">{p.resident?.nama_lengkap}</td>
                                    <td className="px-6 py-4 uppercase text-xs font-semibold tracking-wider text-muted-foreground">{p.jenis}</td>
                                    <td className="px-6 py-4 text-[#0070f3]">{formatCurrency(p.jumlah)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wider ${p.status === 'lunas' ? 'bg-[#0070f3]/10 text-[#0070f3]' : 'bg-destructive/10 text-destructive'}`}>
                                            {p.status === 'lunas' ? 'LUNAS' : 'BELUM BAYAR'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {p.status === 'belum_lunas' && (
                                            <Button size="sm" variant="outline" onClick={() => markPaidMutation.mutate(p.id)} className="h-8 border-border text-foreground hover:bg-muted hover:text-foreground">
                                                <Check size={14} className="mr-1" /> Bayar
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {payments.length === 0 && (
                                <tr><td colSpan="7" className="text-center py-8 text-muted-foreground">Belum ada data iuran.</td></tr>
                            )}
                        </tbody>
                    </table>
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-border">
                            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                            </Button>
                            <span className="text-sm text-muted-foreground">Hal {page} dari {totalPages}</span>
                            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                                Next <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}