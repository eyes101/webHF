// components/ArtisanHireNegotiationModal.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../utils/currency';
import { whatsappLink } from '../config/contacts';

const PILLAR_ARTISANS_MAP = {
  electrical: {
    title: 'Electrical & Power Systems',
    icon: '⚡',
    artisans: [
      { id: 'art-1', name: 'Emeka Obi', trade: 'Master Electrician', rating: 4.9, jobs: 148, baseLaborNaira: 25000, verified: true, skills: ['Complete Rewiring', 'Solar Inverter Setup', 'Generator ATS', 'Surge Diagnostics'] },
      { id: 'art-2', name: 'Chika Eze', trade: 'HVAC & Power Specialist', rating: 4.8, jobs: 92, baseLaborNaira: 20000, verified: true, skills: ['Inverter AC Wiring', 'Panel Upgrades', 'Socket Balancing'] },
    ],
    commonTasks: [
      { title: 'Full House Cable Rewiring & DB Load Balance', defaultMaterials: 80000, defaultLabor: 45000 },
      { title: 'Hybrid Solar Inverter & Battery Bank Setup', defaultMaterials: 350000, defaultLabor: 60000 },
      { title: 'Automatic Generator Changeover (ATS) Installation', defaultMaterials: 45000, defaultLabor: 25000 },
      { title: 'Smart Lighting, Breakers & Socket Fit-Out', defaultMaterials: 30000, defaultLabor: 20000 },
    ],
  },
  plumbing: {
    title: 'Plumbing & Water Infrastructure',
    icon: '🚰',
    artisans: [
      { id: 'art-3', name: 'Bisi Adewale', trade: 'Certified Master Plumber', rating: 4.9, jobs: 165, baseLaborNaira: 22000, verified: true, skills: ['Acoustic Leak Detection', 'Borehole Pumps', 'Bathroom Suites', 'PPR Fusion'] },
      { id: 'art-4', name: 'Kabir Usman', trade: 'Drainage & Pipe Specialist', rating: 4.8, jobs: 84, baseLaborNaira: 18000, verified: true, skills: ['High Pressure Jetting', 'Soakaways', 'Water Filtration'] },
    ],
    commonTasks: [
      { title: 'Non-Invasive Acoustic Pipe Leak Diagnosis & Repair', defaultMaterials: 25000, defaultLabor: 30000 },
      { title: 'Borehole Submersible Pump & Water Filtration Setup', defaultMaterials: 180000, defaultLabor: 50000 },
      { title: 'Water Heater & Modern Bathroom Suite Fitting', defaultMaterials: 65000, defaultLabor: 35000 },
      { title: 'Drainage Jetting & Soakaway Line Servicing', defaultMaterials: 20000, defaultLabor: 28000 },
    ],
  },
  carpentry: {
    title: 'Carpentry & Interior Fit-Out',
    icon: '🔨',
    artisans: [
      { id: 'art-5', name: 'Tunde Bakare', trade: 'Architectural Joiner & Cabinetry', rating: 5.0, jobs: 138, baseLaborNaira: 35000, verified: true, skills: ['Modular Kitchens', 'Walk-in Wardrobes', 'POP Ceilings', 'Security Doors'] },
      { id: 'art-6', name: 'Samuel Okon', trade: 'Finish Carpenter & Tiler', rating: 4.8, jobs: 79, baseLaborNaira: 25000, verified: true, skills: ['Door Hanging', 'Porcelain Tiling', 'Custom Furniture'] },
    ],
    commonTasks: [
      { title: 'Custom Modular Kitchen Cabinetry & LED Fitting', defaultMaterials: 450000, defaultLabor: 120000 },
      { title: 'Master Walk-In Wardrobe & Closet System', defaultMaterials: 280000, defaultLabor: 85000 },
      { title: 'POP False Ceiling with Warm LED Cove Slots', defaultMaterials: 140000, defaultLabor: 65000 },
      { title: 'Hardwood Security Door Joinery & Smart Lock Installation', defaultMaterials: 75000, defaultLabor: 30000 },
    ],
  },
  property: {
    title: 'Building Maintenance & Surface Care',
    icon: '🏠',
    artisans: [
      { id: 'art-7', name: 'Ibrahim Musa', trade: 'Mason & Surface Finisher', rating: 4.9, jobs: 172, baseLaborNaira: 28000, verified: true, skills: ['Tile Repairs', 'Waterproofing', 'Wall Patching', 'Screeding'] },
      { id: 'art-8', name: 'Grace Nnamdi', trade: 'Master Painter & Colorist', rating: 4.9, jobs: 115, baseLaborNaira: 24000, verified: true, skills: ['Weather-Shield Exterior', 'Interior Wall Screeding', 'Moisture Sealing'] },
    ],
    commonTasks: [
      { title: 'Interior & Exterior Weather-Shield Painting', defaultMaterials: 180000, defaultLabor: 75000 },
      { title: 'Bituminous Roof Waterproofing & Leak Sealing', defaultMaterials: 95000, defaultLabor: 45000 },
      { title: 'Porcelain Tile Re-Grouting & Surface Crack Patching', defaultMaterials: 40000, defaultLabor: 30000 },
      { title: 'Wall Plastering, Screeding & Damp Proofing', defaultMaterials: 55000, defaultLabor: 35000 },
    ],
  },
};

export default function ArtisanHireNegotiationModal({ pillarId, onClose }) {
  const pillarKey = (pillarId || 'electrical').toLowerCase().includes('plumb')
    ? 'plumbing'
    : (pillarId || '').toLowerCase().includes('carp')
    ? 'carpentry'
    : (pillarId || '').toLowerCase().includes('prop')
    ? 'property'
    : 'electrical';

  const pillarData = PILLAR_ARTISANS_MAP[pillarKey] || PILLAR_ARTISANS_MAP.electrical;

  const [selectedArtisan, setSelectedArtisan] = useState(pillarData.artisans[0]);
  const [taskTitle, setTaskTitle] = useState(pillarData.commonTasks[0].title);
  const [taskDescription, setTaskDescription] = useState('');
  const [materialsNaira, setMaterialsNaira] = useState(pillarData.commonTasks[0].defaultMaterials);
  const [laborNaira, setLaborNaira] = useState(pillarData.commonTasks[0].defaultLabor);
  const [urgency, setUrgency] = useState('Standard (24-48 Hours)');
  const [address, setAddress] = useState('');

  const { addItem } = useCart();
  const navigate = useNavigate();

  // Handle Preset Task Selection
  const handleTaskPresetChange = (task) => {
    setTaskTitle(task.title);
    setMaterialsNaira(task.defaultMaterials);
    setLaborNaira(task.defaultLabor);
  };

  // Mathematical calculations for escrow
  const materialsCost = Math.max(0, parseInt(materialsNaira, 10) || 0);
  const laborCost = Math.max(0, parseInt(laborNaira, 10) || 0);
  const totalAgreedContractNaira = materialsCost + laborCost;

  // Milestone 1: 100% of materials + 30% of labor for mobilization
  const milestone1Naira = materialsCost + Math.round(laborCost * 0.3);
  // Milestone 2: Remaining 70% of labor on final customer sign-off
  const milestone2Naira = Math.round(laborCost * 0.7);

  const handleFundEscrow = () => {
    if (!taskTitle.trim() || !address.trim()) {
      alert('Please fill in the task details and job site address.');
      return;
    }

    const taskItem = {
      id: `p2p-${Date.now()}`,
      name: `[P2P Escrow Task] ${taskTitle} — ${selectedArtisan.name} (${selectedArtisan.trade})`,
      category: 'P2P Artisan Escrow',
      price_cents: totalAgreedContractNaira * 100,
      unit: 'Contract Scope',
      description: `Assigned to: ${selectedArtisan.name}. Materials: ${formatNaira(materialsCost * 100)} | Workmanship: ${formatNaira(laborCost * 100)}. Milestones: ₦${milestone1Naira.toLocaleString()} Mobilization / ₦${milestone2Naira.toLocaleString()} Sign-off. Location: ${address}. Notes: ${taskDescription || 'None'}`,
    };

    addItem(taskItem, 1);
    onClose();
    navigate('/checkout');
  };

  const handleNegotiateOnWhatsApp = () => {
    const message = `Hello Halfcon Operations,\n\nI want to hire verified artisan *${selectedArtisan.name}* (${selectedArtisan.trade}) for a P2P task:\n\n📋 *Task:* ${taskTitle}\n📍 *Site Address:* ${address || 'Pending'}\n⏱️ *Timeline:* ${urgency}\n\n💰 *Mathematical Contract Breakdown:*\n• Materials Budget: ₦${materialsCost.toLocaleString()}\n• Workmanship Labor: ₦${laborCost.toLocaleString()}\n• *Total Contract Value:* ₦${totalAgreedContractNaira.toLocaleString()}\n• Milestone 1 (Mobilization): ₦${milestone1Naira.toLocaleString()}\n• Milestone 2 (Sign-off Release): ₦${milestone2Naira.toLocaleString()}\n\nPlease review and finalize agreement with the artisan.`;
    window.open(whatsappLink(message), '_blank');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '820px', padding: '0', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ background: '#0F1B4C', color: '#ffffff', padding: '24px 32px', position: 'relative' }}>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', top: '20px', right: '20px' }}
          >
            ✕
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '24px' }}>{pillarData.icon}</span>
            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#FBBF24', letterSpacing: '0.06em' }}>
              P2P Artisan Hire &amp; Task Escrow Agreement
            </div>
          </div>
          <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: '30px', fontWeight: 900, textTransform: 'uppercase', margin: 0, letterSpacing: '0.01em' }}>
            Hire Verified {pillarData.title} Specialist
          </h2>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', marginTop: '4px' }}>
            Direct negotiation with milestone-based escrow protection. Funds are held safely until you sign off.
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '28px 32px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Step 1: Select Verified Artisan */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--ink)', letterSpacing: '0.04em', marginBottom: '12px' }}>
              1. Select Assigned Verified Specialist
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {pillarData.artisans.map((art) => {
                const isSelected = selectedArtisan.id === art.id;
                return (
                  <div
                    key={art.id}
                    className="card"
                    style={{
                      cursor: 'pointer',
                      borderColor: isSelected ? 'var(--rust)' : 'var(--line)',
                      background: isSelected ? 'var(--rust-light)' : '#ffffff',
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                    }}
                    onClick={() => setSelectedArtisan(art)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--ink)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}>
                          {art.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--ink)' }}>{art.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--steel)' }}>{art.trade}</div>
                        </div>
                      </div>
                      <span className="badge badge-green" style={{ fontSize: '10px' }}>✓ Verified</span>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--steel)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>⭐ {art.rating} ({art.jobs} jobs)</span>
                      <span style={{ fontWeight: 700, color: 'var(--ink)' }}>Base: ₦{art.baseLaborNaira.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Task Preset & Custom Details */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--ink)', letterSpacing: '0.04em', marginBottom: '10px' }}>
              2. Choose Benchmark Task or Enter Custom Scope
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              {pillarData.commonTasks.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`btn btn-sm ${taskTitle === t.title ? 'btn-solid' : ''}`}
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                  onClick={() => handleTaskPresetChange(t)}
                >
                  {t.title}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Task Title / Summary *</label>
                <input
                  type="text"
                  className="input"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Distribution Board Rewiring & Surge Protection"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Urgency Level</label>
                <select
                  className="input"
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                >
                  <option>Emergency Dispatch (Within 2-4 Hours)</option>
                  <option>Standard (24-48 Hours)</option>
                  <option>Scheduled Multi-Day Project</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Execution Address in Lagos/Nigeria *</label>
              <input
                type="text"
                className="input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 14 Admiralty Way, Lekki Phase 1, Lagos"
                required
              />
            </div>
          </div>

          {/* Step 3: P2P Mathematical Escrow Agreement Breakdown */}
          <div style={{ background: '#F8FAFC', border: '1.5px solid var(--line)', borderRadius: 'var(--radius-lg)', padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--ink)' }}>
                  3. Mathematical Budget &amp; Escrow Milestone Calculation
                </div>
                <div style={{ fontSize: '12px', color: 'var(--steel)' }}>Adjust materials allowance and proposed labor fees</div>
              </div>
              <span className="badge badge-blue">Escrow Protected</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--ink)' }}>
                  Estimated Materials / Parts Budget (₦)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--steel)' }}>₦</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    className="input"
                    value={materialsNaira}
                    onChange={(e) => setMaterialsNaira(e.target.value)}
                    style={{ paddingLeft: '32px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}
                  />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--steel)', marginTop: '4px' }}>Disbursed for physical cables, pipes, boards, or wood.</div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--ink)' }}>
                  Negotiated Labor / Workmanship Fee (₦)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--steel)' }}>₦</span>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    className="input"
                    value={laborNaira}
                    onChange={(e) => setLaborNaira(e.target.value)}
                    style={{ paddingLeft: '32px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}
                  />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--steel)', marginTop: '4px' }}>Artisan service fee for certified technical work.</div>
              </div>
            </div>

            {/* Escrow Milestone Breakdown Table */}
            <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--steel)', marginBottom: '12px', letterSpacing: '0.04em' }}>
                Payment &amp; Release Schedule
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span>📦 <strong>Milestone 1 (Mobilization &amp; Materials):</strong></span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: 'var(--ink)' }}>
                    ₦{milestone1Naira.toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--steel)', marginLeft: '24px' }}>
                  (100% of materials budget + 30% labor deposit for technician mobilization)
                </div>

                <div style={{ height: '1px', background: 'var(--line)' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span>🏁 <strong>Milestone 2 (Completion &amp; Client Sign-Off):</strong></span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: '#16A34A' }}>
                    ₦{milestone2Naira.toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--steel)', marginLeft: '24px' }}>
                  (Remaining 70% labor released strictly after you inspect &amp; approve quality)
                </div>

                <div style={{ height: '1px', background: 'var(--line)' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '4px' }}>
                  <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--ink)' }}>Total Contract Value:</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 900, fontSize: '24px', color: 'var(--rust)' }}>
                    ₦{totalAgreedContractNaira.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer / Actions */}
        <div style={{ padding: '20px 32px', borderTop: '1px solid var(--line)', background: '#FAFAFA', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '12px', color: 'var(--steel)' }}>
            🔒 <strong>Halfcon Escrow Guarantee:</strong> 100% money-back protection if technician defaults.
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-dark"
              onClick={handleNegotiateOnWhatsApp}
            >
              💬 Negotiate on WhatsApp
            </button>

            <button
              type="button"
              className="btn btn-solid btn-lg"
              onClick={handleFundEscrow}
            >
              Fund Escrow &amp; Assign Artisan (₦{totalAgreedContractNaira.toLocaleString()}) →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
