import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Residents() {
    const queryClient = useQueryClient();
    const [filterStatus, setFilterStatus] = useState('all');
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        nama_lengkap: '',
        status_penghuni: 'tetap',
        nomor_telepon: '',
        status_menikah: '0',
        foto_ktp: null
    });

    const { data: residents = [], isLoading } = useQuery({
        queryKey: ['residents', filterStatus],
        queryFn: async () => {
            const url = filterStatus !== 'all' ? `/residents?status_penghuni=${filterStatus}` : '/residents';
            const { data } = await api.get(url);
            return data;
        }
    });
    const paginatedResidents = residents.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    const totalPages = Math.ceil(residents.length / ITEMS_PER_PAGE);

    const mutation = useMutation({
        mutationFn: async (formDataObj) => {
            const headers = { 'Content-Type': 'multipart/form-data' };
            if (editingId) {
                // Laravel handling multipart PUT request sometimes needs POST with _method=PUT
                formDataObj.append('_method', 'PUT');
                return api.post(`/residents/${editingId}`, formDataObj, { headers });
            }
            return api.post('/residents', formDataObj, { headers });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['residents']);
            setIsOpen(false);
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => api.delete(`/residents/${id}`),
        onSuccess: () => queryClient.invalidateQueries(['residents'])
    });


    const handleSubmit = (e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append('nama_lengkap', formData.nama_lengkap);
        fd.append('status_penghuni', formData.status_penghuni);
        fd.append('nomor_telepon', formData.nomor_telepon);
        fd.append('status_menikah', formData.status_menikah);
        
        if (formData.foto_ktp instanceof File) {
            const reader = new FileReader();
            reader.readAsDataURL(formData.foto_ktp);
            reader.onload = () => {
                fd.append('foto_ktp', reader.result);
                mutation.mutate(fd);
            };
        } else {
            mutation.mutate(fd);
        }
    };

    const handleEdit = (resident) => {
        setEditingId(resident.id);
        setFormData({
            nama_lengkap: resident.nama_lengkap,
            status_penghuni: resident.status_penghuni,
            nomor_telepon: resident.nomor_telepon || '',
            status_menikah: resident.status_menikah ? '1' : '0',
            foto_ktp: null
        });
        setIsOpen(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            nama_lengkap: '',
            status_penghuni: 'tetap',
            nomor_telepon: '',
            status_menikah: '0',
            foto_ktp: null
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Data Penghuni</h2>
                
                <div className="flex space-x-4">
                    <Select value={filterStatus} onValueChange={(val) => { setFilterStatus(val); setPage(1); }}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Filter Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua</SelectItem>
                            <SelectItem value="tetap">Tetap</SelectItem>
                            <SelectItem value="kontrak">Kontrak</SelectItem>
                        </SelectContent>
                    </Select>

                    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if(!open) resetForm(); }}>
                        <DialogTrigger asChild>
                            <Button><Plus className="mr-2" size={16} /> Tambah Penghuni</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingId ? 'Edit Penghuni' : 'Tambah Penghuni Baru'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.nama_lengkap}
                                        onChange={e => setFormData({...formData, nama_lengkap: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status Penghuni</label>
                                    <Select 
                                        value={formData.status_penghuni} 
                                        onValueChange={v => setFormData({...formData, status_penghuni: v})}
                                    >
                                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="tetap">Tetap</SelectItem>
                                            <SelectItem value="kontrak">Kontrak</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nomor Telepon</label>
                                    <input 
                                        type="text" 
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.nomor_telepon}
                                        onChange={e => setFormData({...formData, nomor_telepon: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status Menikah</label>
                                    <Select 
                                        value={formData.status_menikah} 
                                        onValueChange={v => setFormData({...formData, status_menikah: v})}
                                    >
                                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Sudah Menikah</SelectItem>
                                            <SelectItem value="0">Belum Menikah</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Foto KTP (Opsional)</label>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        onChange={e => setFormData({...formData, foto_ktp: e.target.files[0]})}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={mutation.isLoading}>
                                    Simpan
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <Card className="shadow-sm border-border overflow-hidden transition-all duration-200 hover:shadow-md hover:border-foreground/20">
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left min-w-[800px]">
                        <thead className="border-b border-border">
                            <tr className="text-muted-foreground text-[13px]">
                                <th className="px-6 py-3 font-medium h-10">Foto KTP</th>
                                <th className="px-6 py-3 font-medium h-10">Nama</th>
                                <th className="px-6 py-3 font-medium h-10">Status</th>
                                <th className="px-6 py-3 font-medium h-10">Telepon</th>
                                <th className="px-6 py-3 font-medium h-10">Menikah</th>
                                <th className="px-6 py-3 font-medium h-10 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
                            ) : paginatedResidents.map((resident) => (
                                <tr key={resident.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4">
                                        {resident.foto_ktp ? (
                                            <img 
                                                src={`http://localhost:8000/storage/${resident.foto_ktp}`} 
                                                alt="KTP" 
                                                className="w-16 h-10 object-cover rounded"
                                            />
                                        ) : <span className="text-gray-400 italic">No KTP</span>}
                                    </td>
                                    <td className="px-6 py-4 font-medium">{resident.nama_lengkap}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wider ${resident.status_penghuni === 'tetap' ? 'bg-[#0070f3]/10 text-[#0070f3]' : 'bg-orange-500/10 text-orange-600'}`}>
                                            {resident.status_penghuni}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{resident.nomor_telepon || '-'}</td>
                                    <td className="px-6 py-4">{resident.status_menikah ? 'Ya' : 'Belum'}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(resident)}>
                                            <Edit size={14} />
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => {
                                            if(confirm('Hapus data penghuni ini?')) deleteMutation.mutate(resident.id)
                                        }}>
                                            <Trash2 size={14} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
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