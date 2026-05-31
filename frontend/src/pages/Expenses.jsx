import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
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

const KATEGORI = [
    'Gaji Satpam',
    'Token Listrik Pos Satpam',
    'Perbaikan Jalan',
    'Perbaikan Selokan',
    'Lainnya'
];

export default function Expenses() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        nama: '',
        jumlah: '',
        tanggal: new Date().toISOString().split('T')[0],
        kategori: 'Lainnya',
        keterangan: ''
    });

    const { data: expenses = [], isLoading } = useQuery({
        queryKey: ['expenses'],
        queryFn: async () => {
            const { data } = await api.get('/expenses');
            return data;
        }
    });

    const paginatedExpenses = expenses.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    const totalPages = Math.ceil(expenses.length / ITEMS_PER_PAGE);

    const mutation = useMutation({
        mutationFn: async (dataObj) => {
            if (editingId) return api.put(`/expenses/${editingId}`, dataObj);
            return api.post('/expenses', dataObj);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['expenses']);
            setIsOpen(false);
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => api.delete(`/expenses/${id}`),
        onSuccess: () => queryClient.invalidateQueries(['expenses'])
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    const handleEdit = (expense) => {
        setEditingId(expense.id);
        setFormData({
            nama: expense.nama,
            jumlah: expense.jumlah,
            tanggal: expense.tanggal,
            kategori: expense.kategori,
            keterangan: expense.keterangan || ''
        });
        setIsOpen(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            nama: '',
            jumlah: '',
            tanggal: new Date().toISOString().split('T')[0],
            kategori: 'Lainnya',
            keterangan: ''
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Pengeluaran RT</h2>
                
                <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if(!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2" size={16} /> Tambah Pengeluaran</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Edit Pengeluaran' : 'Tambah Pengeluaran Baru'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nama Pengeluaran</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.nama}
                                    onChange={e => setFormData({...formData, nama: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Kategori</label>
                                <Select value={formData.kategori} onValueChange={v => setFormData({...formData, kategori: v})}>
                                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {KATEGORI.map(kat => (
                                            <SelectItem key={kat} value={kat}>{kat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tanggal</label>
                                    <input 
                                        type="date" 
                                        required 
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.tanggal}
                                        onChange={e => setFormData({...formData, tanggal: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Jumlah (Rp)</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        required 
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.jumlah}
                                        onChange={e => setFormData({...formData, jumlah: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Keterangan (Opsional)</label>
                                <textarea 
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-20"
                                    value={formData.keterangan}
                                    onChange={e => setFormData({...formData, keterangan: e.target.value})}
                                ></textarea>
                            </div>
                            <Button type="submit" className="w-full" disabled={mutation.isLoading}>
                                Simpan
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="shadow-sm border-border overflow-hidden transition-all duration-200 hover:shadow-md hover:border-foreground/20">
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left min-w-[800px]">
                        <thead className="border-b border-border bg-muted/20">
                            <tr className="text-muted-foreground text-[13px]">
                                <th className="px-6 py-3 font-medium h-10">Tanggal</th>
                                <th className="px-6 py-3 font-medium h-10">Nama</th>
                                <th className="px-6 py-3 font-medium h-10">Kategori</th>
                                <th className="px-6 py-3 font-medium h-10">Keterangan</th>
                                <th className="px-6 py-3 font-medium h-10 text-right">Jumlah</th>
                                <th className="px-6 py-3 font-medium h-10 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
                            ) : paginatedExpenses.map((expense) => (
                                <tr key={expense.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4 text-foreground">{expense.tanggal}</td>
                                    <td className="px-6 py-4 font-medium text-foreground">{expense.nama}</td>
                                    <td className="px-6 py-4 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{expense.kategori}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{expense.keterangan || '-'}</td>
                                    <td className="px-6 py-4 text-right text-foreground font-semibold">
                                        -{formatCurrency(expense.jumlah)}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(expense)} className="h-8 w-8 p-0">
                                            <Edit size={14} />
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => {
                                            if(confirm('Hapus data pengeluaran ini?')) deleteMutation.mutate(expense.id)
                                        }} className="h-8 w-8 p-0">
                                            <Trash2 size={14} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {expenses.length === 0 && (
                                <tr><td colSpan="6" className="text-center py-8 text-muted-foreground">Belum ada pengeluaran.</td></tr>
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