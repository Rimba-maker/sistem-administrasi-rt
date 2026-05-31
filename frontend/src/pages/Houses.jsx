import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Home as HomeIcon, History, UserPlus, FileText, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '../lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Houses() {
    const queryClient = useQueryClient();
    const [selectedHouse, setSelectedHouse] = useState(null);
    const [modalView, setModalView] = useState(''); // 'add', 'assign', 'history', 'payments'
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 12;
    
    // For assigning
    const [residentId, setResidentId] = useState('');
    const [tanggalMulai, setTanggalMulai] = useState('');
    
    // For adding/editing
    const [houseForm, setHouseForm] = useState({ nomor_rumah: '', blok: '', status: 'tidak_dihuni' });
    const { data: houses = [], isLoading } = useQuery({
        queryKey: ['houses'],
        queryFn: async () => {
            const { data } = await api.get('/houses');
            return data;
        }
    });
    const paginatedHouses = houses.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    const totalPages = Math.ceil(houses.length / ITEMS_PER_PAGE);

    const { data: residents = [] } = useQuery({
        queryKey: ['residents'],
        queryFn: async () => {
            const { data } = await api.get('/residents');
            return data;
        }
    });

    const { data: historyData = [] } = useQuery({
        queryKey: ['house-history', selectedHouse?.id],
        queryFn: async () => {
            const { data } = await api.get(`/houses/${selectedHouse.id}/history`);
            return data;
        },
        enabled: modalView === 'history' && !!selectedHouse
    });

    const { data: paymentsData = [] } = useQuery({
        queryKey: ['house-payments', selectedHouse?.id],
        queryFn: async () => {
            const { data } = await api.get(`/houses/${selectedHouse.id}/payments`);
            return data;
        },
        enabled: modalView === 'payments' && !!selectedHouse
    });

    const assignMutation = useMutation({
        mutationFn: async () => {
            return api.post(`/houses/${selectedHouse.id}/assign-resident`, {
                resident_id: residentId,
                tanggal_mulai: tanggalMulai
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['houses']);
            closeModal();
        }
    });

    const saveMutation = useMutation({
        mutationFn: async () => {
            return api.post('/houses', houseForm);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['houses']);
            closeModal();
        },
        onError: (err) => {
            alert(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data rumah');
        }
    });

    const openModal = (house, view) => {
        setSelectedHouse(house);
        setModalView(view);
        setResidentId('');
        setTanggalMulai(new Date().toISOString().split('T')[0]);
    };

    const openAddModal = () => {
        setSelectedHouse(null);
        setHouseForm({ nomor_rumah: '', blok: '', status: 'tidak_dihuni' });
        setModalView('add');
    };

    const closeModal = () => {
        setSelectedHouse(null);
        setModalView('');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Data Rumah</h2>
                <Button onClick={openAddModal}>
                    <Plus className="mr-2" size={16} /> Tambah Rumah
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {isLoading ? (
                    <div className="col-span-full flex h-[40vh] items-center justify-center space-x-2">
                        <div className="h-4 w-4 animate-bounce rounded-full bg-primary" style={{ animationDelay: '-0.3s' }}></div>
                        <div className="h-4 w-4 animate-bounce rounded-full bg-primary" style={{ animationDelay: '-0.15s' }}></div>
                        <div className="h-4 w-4 animate-bounce rounded-full bg-primary"></div>
                    </div>
                ) : paginatedHouses.map((house) => (
                    <Card key={house.id} className={`shadow-sm border transition-all duration-200 hover:shadow-md ${house.status === 'dihuni' ? 'border-[#0070f3]/20 hover:border-[#0070f3]/50' : 'border-border hover:border-foreground/20'}`}>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex justify-between items-center text-lg">
                                <span>{house.blok ? `${house.blok} - ` : ''}{house.nomor_rumah}</span>
                                <HomeIcon className={house.status === 'dihuni' ? 'text-[#0070f3]' : 'text-muted-foreground'} />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wider ${
                                    house.status === 'dihuni' ? 'bg-[#0070f3]/10 text-[#0070f3]' : 'bg-muted text-muted-foreground'
                                }`}>
                                    {house.status === 'dihuni' ? 'Dihuni' : 'Kosong'}
                                </span>
                            </div>

                            {house.status === 'dihuni' && house.active_resident ? (
                                <div className="text-sm text-gray-600 mb-4">
                                    <p className="font-medium text-foreground">{house.active_resident.resident?.nama_lengkap}</p>
                                    <p className="text-muted-foreground">Sejak: {house.active_resident.tanggal_mulai}</p>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground mb-4 italic">Belum ada penghuni</div>
                            )}

                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                                <Button variant="outline" size="sm" onClick={() => openModal(house, 'assign')}>
                                    <UserPlus size={14} className="mr-1" /> Assign
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => openModal(house, 'history')}>
                                    <History size={14} className="mr-1" /> History
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => openModal(house, 'payments')}>
                                    <FileText size={14} className="mr-1" /> Iuran
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-border mt-4">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                        <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                    </Button>
                    <span className="text-sm text-muted-foreground">Hal {page} dari {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            )}

            <Dialog open={!!modalView} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="sm:max-w-2xl w-[95vw] overflow-hidden flex flex-col max-h-[90vh] p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>
                            {modalView === 'add' && 'Tambah Data Rumah'}
                            {modalView === 'assign' && `Assign Penghuni - Rumah ${selectedHouse?.nomor_rumah}`}
                            {modalView === 'history' && `History Penghuni - Rumah ${selectedHouse?.nomor_rumah}`}
                            {modalView === 'payments' && `History Pembayaran - Rumah ${selectedHouse?.nomor_rumah}`}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="py-2 w-full overflow-hidden flex-1 flex flex-col">
                        {modalView === 'add' && (
                            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nomor Rumah</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={houseForm.nomor_rumah}
                                        onChange={e => setHouseForm({...houseForm, nomor_rumah: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Blok (Opsional)</label>
                                    <input 
                                        type="text" 
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={houseForm.blok}
                                        onChange={e => setHouseForm({...houseForm, blok: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status Hunian</label>
                                    <Select value={houseForm.status} onValueChange={(val) => setHouseForm({...houseForm, status: val})}>
                                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="dihuni">Dihuni</SelectItem>
                                            <SelectItem value="tidak_dihuni">Kosong / Tidak Dihuni</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit" className="w-full" disabled={saveMutation.isLoading}>
                                    Simpan Rumah
                                </Button>
                            </form>
                        )}

                        {modalView === 'assign' && (
                            <form onSubmit={(e) => { e.preventDefault(); assignMutation.mutate(); }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Pilih Penghuni</label>
                                    <Select value={residentId} onValueChange={setResidentId} required>
                                        <SelectTrigger className="w-full"><SelectValue placeholder="Pilih..." /></SelectTrigger>
                                        <SelectContent>
                                            {residents.map(r => (
                                                <SelectItem key={r.id} value={r.id.toString()}>{r.nama_lengkap} ({r.status_penghuni})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tanggal Mulai Menempati</label>
                                    <input 
                                        type="date" 
                                        required 
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={tanggalMulai}
                                        onChange={e => setTanggalMulai(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={assignMutation.isLoading || !residentId}>
                                    Assign ke Rumah
                                </Button>
                            </form>
                        )}
                        {modalView === 'history' && (
                            <div className="overflow-x-auto w-full border rounded-md">
                                <table className="w-full text-sm text-left min-w-[600px]">
                                    <thead className="border-b border-border">
                                        <tr className="text-muted-foreground text-[13px]">
                                            <th className="px-4 py-2 font-medium h-10 whitespace-nowrap">Nama</th>
                                            <th className="px-4 py-2 font-medium h-10 whitespace-nowrap">Mulai</th>
                                            <th className="px-4 py-2 font-medium h-10 whitespace-nowrap">Selesai</th>
                                            <th className="px-4 py-2 font-medium h-10 whitespace-nowrap">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historyData.map((h) => (
                                            <tr key={h.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                                                <td className="px-4 py-3 whitespace-nowrap">{h.resident?.nama_lengkap}</td>
                                                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{h.tanggal_mulai}</td>
                                                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{h.tanggal_selesai || '-'}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {h.is_active ? <span className="text-green-600 font-medium">Aktif</span> : <span className="text-muted-foreground">Selesai</span>}
                                                </td>
                                            </tr>
                                        ))}
                                        {historyData.length === 0 && (
                                            <tr><td colSpan="4" className="text-center py-4 text-muted-foreground">Belum ada history.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {modalView === 'payments' && (
                            <div className="max-h-[60vh] overflow-y-auto overflow-x-auto w-full border rounded-md">
                                <table className="w-full text-sm text-left min-w-[600px]">
                                    <thead className="border-b border-border sticky top-0 bg-background z-10">
                                        <tr className="text-muted-foreground text-[13px]">
                                            <th className="px-4 py-2 font-medium h-10 whitespace-nowrap">Bulan/Tahun</th>
                                            <th className="px-4 py-2 font-medium h-10 whitespace-nowrap">Jenis</th>
                                            <th className="px-4 py-2 font-medium h-10 whitespace-nowrap">Penghuni saat itu</th>
                                            <th className="px-4 py-2 font-medium h-10 whitespace-nowrap">Jumlah</th>
                                            <th className="px-4 py-2 font-medium h-10 whitespace-nowrap">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paymentsData.map((p) => (
                                            <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{p.bulan}/{p.tahun}</td>
                                                <td className="px-4 py-3 uppercase text-xs tracking-wider text-muted-foreground whitespace-nowrap">{p.jenis}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">{p.resident?.nama_lengkap || '-'}</td>
                                                <td className="px-4 py-3 text-[#0070f3] whitespace-nowrap">{formatCurrency(p.jumlah)}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wider ${p.status === 'lunas' ? 'bg-[#0070f3]/10 text-[#0070f3]' : 'bg-destructive/10 text-destructive'}`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {paymentsData.length === 0 && (
                                            <tr><td colSpan="5" className="text-center py-4 text-muted-foreground">Belum ada data iuran.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}