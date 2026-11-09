import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';

type TabKey = 'company_group' | 'seller_group' | 'buyer_group' | 'agent_group' | 'user_ops_rights';

interface UserOpsRow { id: string; userId: string; warehouse: string; companyGroup: string; sellerGroup: string; buyerGroup: string; agentGroup: string; status: string }

const DEFAULT_COMPANY = ['All','EU','Non EU','Contractors'];
const DEFAULT_SELLER = ['Small stores','All','Re-sellers','Key Sellers'];
const DEFAULT_BUYER = ['Standard','All','Key buyers'];
const DEFAULT_AGENT = ['Standard','All','Key agents'];

function useLocalState<T>(key: string, fallback: T) {
  const [s, setS] = useState<T>(() => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback; } catch { return fallback; } });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(s)); } catch {} }, [key, s]);
  return [s, setS] as const;
}

export default function BusinessAdminTables(){
  const [activeTab, setActiveTab] = useState<TabKey>('company_group');

  const [companyGroup, setCompanyGroup] = useLocalState<string[]>('biz_company_group', DEFAULT_COMPANY);
  const [sellerGroup, setSellerGroup] = useLocalState<string[]>('biz_seller_group', DEFAULT_SELLER);
  const [buyerGroup, setBuyerGroup] = useLocalState<string[]>('biz_buyer_group', DEFAULT_BUYER);
  const [agentGroup, setAgentGroup] = useLocalState<string[]>('biz_agent_group', DEFAULT_AGENT);
  const [userOps, setUserOps] = useLocalState<UserOpsRow[]>('biz_user_ops', [
    { id: 'u1', userId: '1001', warehouse: 'Rotterdam', companyGroup: 'All', sellerGroup: 'Small stores', buyerGroup: 'Standard', agentGroup: 'Standard', status: 'Active' }
  ]);

  // UI state
  const [adding, setAdding] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingUser, setEditingUser] = useState<UserOpsRow | null>(null);

  // helpers
  const listFor = (tab: TabKey) => {
    switch(tab){
      case 'company_group': return companyGroup;
      case 'seller_group': return sellerGroup;
      case 'buyer_group': return buyerGroup;
      case 'agent_group': return agentGroup;
      default: return [] as string[];
    }
  };

  function addItem(tab: TabKey){
    if(!newValue.trim()) return; const v = newValue.trim();
    if(tab === 'company_group') setCompanyGroup(prev => [v, ...prev]);
    if(tab === 'seller_group') setSellerGroup(prev => [v, ...prev]);
    if(tab === 'buyer_group') setBuyerGroup(prev => [v, ...prev]);
    if(tab === 'agent_group') setAgentGroup(prev => [v, ...prev]);
    setNewValue(''); setAdding(false);
  }

  function editItem(tab: TabKey, index: number){
    const list = listFor(tab);
    const val = list[index];
    setEditingId(`${tab}_${index}`);
    setEditingValue(val);
  }

  function saveEdit(tab: TabKey, index: number){
    if(!editingId) return;
    if(tab === 'company_group') setCompanyGroup(prev => prev.map((p,i)=> i===index?editingValue:p));
    if(tab === 'seller_group') setSellerGroup(prev => prev.map((p,i)=> i===index?editingValue:p));
    if(tab === 'buyer_group') setBuyerGroup(prev => prev.map((p,i)=> i===index?editingValue:p));
    if(tab === 'agent_group') setAgentGroup(prev => prev.map((p,i)=> i===index?editingValue:p));
    setEditingId(null); setEditingValue('');
  }

  function removeItem(tab: TabKey, index: number){
    if(tab === 'company_group') setCompanyGroup(prev => prev.filter((_,i)=>i!==index));
    if(tab === 'seller_group') setSellerGroup(prev => prev.filter((_,i)=>i!==index));
    if(tab === 'buyer_group') setBuyerGroup(prev => prev.filter((_,i)=>i!==index));
    if(tab === 'agent_group') setAgentGroup(prev => prev.filter((_,i)=>i!==index));
  }

  function saveUser(row: UserOpsRow){
    setUserOps(prev => prev.map(p => p.id === row.id ? row : p));
    setEditingUser(null);
  }

  return (
    <div>
      <div className="bg-white rounded-lg border p-4 mb-4">
        <div className="flex gap-2">
          <button onClick={()=>setActiveTab('company_group')} className={`px-3 py-2 rounded ${activeTab==='company_group'?'bg-[#0B1F3A] text-white':'bg-gray-100 text-gray-700'}`}>Company groups</button>
          <button onClick={()=>setActiveTab('seller_group')} className={`px-3 py-2 rounded ${activeTab==='seller_group'?'bg-[#0B1F3A] text-white':'bg-gray-100 text-gray-700'}`}>Seller groups</button>
          <button onClick={()=>setActiveTab('buyer_group')} className={`px-3 py-2 rounded ${activeTab==='buyer_group'?'bg-[#0B1F3A] text-white':'bg-gray-100 text-gray-700'}`}>Buyer groups</button>
          <button onClick={()=>setActiveTab('agent_group')} className={`px-3 py-2 rounded ${activeTab==='agent_group'?'bg-[#0B1F3A] text-white':'bg-gray-100 text-gray-700'}`}>Agent groups</button>
          <button onClick={()=>setActiveTab('user_ops_rights')} className={`px-3 py-2 rounded ${activeTab==='user_ops_rights'?'bg-[#0B1F3A] text-white':'bg-gray-100 text-gray-700'}`}>User operations rights</button>
        </div>
      </div>

      <div>
        {(activeTab === 'company_group' || activeTab === 'seller_group' || activeTab === 'buyer_group' || activeTab === 'agent_group') && (
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{activeTab.replace('_',' ')}</h3>
              <div className="flex items-center gap-2">
                {adding ? (
                  <div className="flex gap-2">
                    <input value={newValue} onChange={e=>setNewValue(e.target.value)} className="px-2 py-1 border rounded" placeholder="New group name" />
                    <button onClick={()=>addItem(activeTab)} className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
                    <button onClick={()=>{ setAdding(false); setNewValue(''); }} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                  </div>
                ) : (
                  <button onClick={()=>setAdding(true)} className="px-3 py-1 bg-[#0B1F3A] text-white rounded">Add group</button>
                )}
              </div>
            </div>

            <Table>
              <TableHeader>
                <tr>
                  <TableHead>#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Actions</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {listFor(activeTab).map((g,i)=> (
                  <TableRow key={i}>
                    <TableCell>{i+1}</TableCell>
                    <TableCell>{editingId === `${activeTab}_${i}` ? <input value={editingValue} onChange={e=>setEditingValue(e.target.value)} className="px-2 py-1 border rounded" /> : g}</TableCell>
                    <TableCell>
                      {editingId === `${activeTab}_${i}` ? (
                        <>
                          <button onClick={()=>saveEdit(activeTab,i)} className="text-green-600 mr-2">Save</button>
                          <button onClick={()=>{ setEditingId(null); setEditingValue(''); }} className="text-gray-600">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={()=>editItem(activeTab,i)} className="text-blue-600 mr-2">Edit</button>
                          <button onClick={()=>removeItem(activeTab,i)} className="text-red-600">Delete</button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === 'user_ops_rights' && (
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">User operations rights</h3>
              <div>
                <button onClick={()=> setUserOps(prev=>[...prev,{ id:`u${Date.now()}`, userId:'new', warehouse:'', companyGroup:'All', sellerGroup:'All', buyerGroup:'All', agentGroup:'All', status:'Active' }])} className="px-3 py-1 bg-[#0B1F3A] text-white rounded">Add user ops</button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <tr>
                  <TableHead>User ID</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Company group</TableHead>
                  <TableHead>Seller group</TableHead>
                  <TableHead>Buyer group</TableHead>
                  <TableHead>Agent group</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {userOps.map(u => (
                  <TableRow key={u.id}>
                    <TableCell>{u.userId}</TableCell>
                    <TableCell>{u.warehouse}</TableCell>
                    <TableCell>{u.companyGroup}</TableCell>
                    <TableCell>{u.sellerGroup}</TableCell>
                    <TableCell>{u.buyerGroup}</TableCell>
                    <TableCell>{u.agentGroup}</TableCell>
                    <TableCell>{u.status}</TableCell>
                    <TableCell>
                      <button onClick={()=>setEditingUser(u)} className="text-blue-600 mr-2">Edit</button>
                      <button onClick={()=>setUserOps(prev=>prev.filter(p=>p.id!==u.id))} className="text-red-600">Delete</button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Edit user modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded p-6 w-full max-w-lg">
            <h4 className="font-semibold mb-3">Edit user ops</h4>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs text-gray-600">User ID<input value={editingUser.userId} onChange={e=>setEditingUser({...editingUser, userId:e.target.value})} className="px-2 py-1 border rounded w-full" /></label>
              <label className="text-xs text-gray-600">Warehouse<input value={editingUser.warehouse} onChange={e=>setEditingUser({...editingUser, warehouse:e.target.value})} className="px-2 py-1 border rounded w-full" /></label>
              <label className="text-xs text-gray-600">Company group<input value={editingUser.companyGroup} onChange={e=>setEditingUser({...editingUser, companyGroup:e.target.value})} className="px-2 py-1 border rounded w-full" /></label>
              <label className="text-xs text-gray-600">Seller group<input value={editingUser.sellerGroup} onChange={e=>setEditingUser({...editingUser, sellerGroup:e.target.value})} className="px-2 py-1 border rounded w-full" /></label>
              <label className="text-xs text-gray-600">Buyer group<input value={editingUser.buyerGroup} onChange={e=>setEditingUser({...editingUser, buyerGroup:e.target.value})} className="px-2 py-1 border rounded w-full" /></label>
              <label className="text-xs text-gray-600">Agent group<input value={editingUser.agentGroup} onChange={e=>setEditingUser({...editingUser, agentGroup:e.target.value})} className="px-2 py-1 border rounded w-full" /></label>
              <label className="text-xs text-gray-600">Status
                <select value={editingUser.status} onChange={e=>setEditingUser({...editingUser, status:e.target.value})} className="px-2 py-1 border rounded w-full">
                  <option>Active</option>
                  <option>Blocked</option>
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={()=>setEditingUser(null)} className="px-3 py-1 border rounded">Cancel</button>
              <button onClick={()=>editingUser && saveUser(editingUser)} className="px-3 py-1 bg-[#0B1F3A] text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
