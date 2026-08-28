import React, { useState } from 'react';
import { useAppStore, UZS_RATE } from '../store/useAppStore';
import { BUSINESS_CATEGORIES } from '../data/businessCategories';
import {
  UserCircle, FolderOpen, Trash2, ArrowRight, Calendar,
  Maximize2, TrendingUp, Package, BarChart3, Edit3, CheckCircle
} from 'lucide-react';

export const UserPanel = () => {
  const { savedProjects, deleteProject, loadSavedProject, setActivePage, currency } = useAppStore();
  const [userName, setUserName] = useState('Foydalanuvchi');
  const [isEditingName, setIsEditingName] = useState(false);

  const formatPrice = (usd) => {
    if (currency === 'UZS') return (usd * UZS_RATE).toLocaleString('uz-UZ') + " So'm";
    return '$' + usd.toLocaleString('en-US');
  };

  const totalInvested = savedProjects.reduce((sum, p) => sum + p.totalCost, 0);
  const totalArea = savedProjects.reduce((sum, p) => sum + p.dimensions.width * p.dimensions.length, 0);

  const handleOpenProject = (proj) => {
    loadSavedProject(proj);
  };

  const initials = userName.slice(0, 2).toUpperCase();

  return (
    <div className="user-profile-container animate-fade-in">

      {/* Profile Header Card */}
      <div className="profile-header-card">
        <div className="avatar-circle">{initials}</div>
        <div style={{ flex: 1 }}>
          {isEditingName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                value={userName}
                onChange={e => setUserName(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.5)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  padding: '4px 12px',
                  outline: 'none',
                  fontFamily: 'Outfit, sans-serif'
                }}
              />
              <button
                onClick={() => setIsEditingName(false)}
                style={{ background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: '8px', padding: '6px 14px', color: '#fff', cursor: 'pointer', fontWeight: 700 }}
              >
                <CheckCircle size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{userName}</h2>
              <button onClick={() => setIsEditingName(true)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '7px', padding: '4px 8px', color: '#fff', cursor: 'pointer' }}>
                <Edit3 size={15} />
              </button>
            </div>
          )}
          <p style={{ opacity: 0.8, fontSize: '0.92rem', marginTop: '0.3rem' }}>ShopPlan Foydalanuvchisi</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: '14px', padding: '1rem 1.5rem' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{savedProjects.length}</div>
            <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>Loyiha</div>
          </div>
          <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: '14px', padding: '1rem 1.5rem' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{totalArea} m²</div>
            <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>Jami Maydon</div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={20} color="var(--accent-blue)" />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Jami Saqlangan</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-blue)' }}>{savedProjects.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ta loyiha</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent-emerald-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color="var(--accent-emerald)" />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Jami Smeta</span>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{formatPrice(totalInvested)}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>barcha loyihalar uchun</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--accent-violet-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={20} color="var(--accent-violet)" />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Jami Maydon</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-violet)' }}>{totalArea} m²</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>reja qilingan</div>
        </div>
      </div>

      {/* Projects List */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FolderOpen size={22} color="var(--accent-blue)" />
            Saqlangan Loyihalar
          </h2>
          <button className="btn-primary" onClick={() => setActivePage('selector')}>
            + Yangi Loyiha
          </button>
        </div>

        {savedProjects.length === 0 ? (
          <div style={{
            background: '#fff',
            border: '2px dashed var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '4rem 2rem',
            textAlign: 'center'
          }}>
            <UserCircle size={56} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Hali loyihalar yo'q
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
              3D Rejalashtiruvchida o'z do'konini loyihalang va smetangizni saqlab qo'ying.
            </p>
            <button className="btn-primary" onClick={() => setActivePage('selector')}>
              Birinchi Loyihani Yaratish
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {savedProjects.map((proj) => (
              <div key={proj.id} className="project-card">
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                    <span className="badge badge-blue">{proj.categoryName}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <Calendar size={12} /> {proj.createdAt}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                    {proj.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Maximize2 size={13} />
                      {proj.dimensions.width}m × {proj.dimensions.length}m ({proj.dimensions.width * proj.dimensions.length} m²)
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Smeta</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                      {formatPrice(proj.totalCost)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => handleOpenProject(proj)}>
                      Ochish <ArrowRight size={15} />
                    </button>
                    <button className="btn-secondary" style={{ padding: '8px 12px', color: 'var(--accent-rose)', borderColor: '#fecdd3' }}
                      onClick={() => deleteProject(proj.id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
