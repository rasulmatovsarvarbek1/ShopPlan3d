import React, { useState } from 'react';
import { useAppStore, UZS_RATE } from '../store/useAppStore';
import { BUSINESS_CATEGORIES } from '../data/businessCategories';
import { 
  ShoppingCart, Shirt, Dumbbell, Sparkles, Smartphone, 
  Coffee, Cross, Wrench, Flower2, BookOpen, ArrowRight, Search
} from 'lucide-react';

const ICON_MAP = {
  ShoppingCart, Shirt, Dumbbell, Sparkles, Smartphone,
  Coffee, Cross, Wrench, Flower2, BookOpen
};

export const BusinessSelectorPage = () => {
  const { selectCategory, currency } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = BUSINESS_CATEGORIES.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (usd) => {
    if (currency === 'UZS') {
      return (usd * UZS_RATE).toLocaleString('uz-UZ') + " So'm";
    }
    return "$" + usd.toLocaleString('en-US');
  };

  return (
    <div className="selector-container animate-fade-in">
      <div className="section-header">
        <h1 className="section-title">
          Qaysi biznes turini yo'lga qo'ymoqchisiz?
        </h1>
        <p className="section-subtitle">
          Quyidagi 10 ta biznes shablonlaridan birini tanlang. Har bir shablon uchun tayyor 3D jihozlar va smeta hisoblangan.
        </p>

        {/* Search Bar */}
        <div style={{
          maxWidth: '500px',
          margin: '1.5rem auto 0',
          position: 'relative'
        }}>
          <Search style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} size={18} />
          <input
            type="text"
            placeholder="Biznes turini qidirish (masalan: fitnes, kofe, oziq-ovqat)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 48px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div className="categories-grid">
        {filteredCategories.map((cat) => {
          const IconComponent = ICON_MAP[cat.icon] || ShoppingCart;
          const area = cat.defaultDimensions.width * cat.defaultDimensions.length;

          return (
            <div
              key={cat.id}
              className="cat-card"
              style={{ '--cat-gradient': cat.gradient }}
              onClick={() => selectCategory(cat)}
            >
              <div className="cat-card-top">
                <div className="cat-icon-wrapper" style={{ background: cat.gradient }}>
                  <IconComponent size={26} />
                </div>
                <span className="cat-badge">{cat.badge}</span>
              </div>

              <div>
                <h3 className="cat-title">{cat.name}</h3>
                <p className="cat-desc">{cat.description}</p>
              </div>

              <div>
                <div className="cat-meta">
                  <div className="cat-meta-item">
                    O'lcham: <strong>{cat.defaultDimensions.width}m × {cat.defaultDimensions.length}m</strong> ({area} m²)
                  </div>
                  <div className="cat-meta-item">
                    Boshlang'ich: <strong>{formatPrice(cat.defaultBudget)}</strong>
                  </div>
                </div>

                <button
                  className="btn-primary"
                  style={{
                    width: '100%',
                    marginTop: '1.25rem',
                    justifyContent: 'center',
                    background: cat.gradient
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectCategory(cat);
                  }}
                >
                  Shablonni Tanlash
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
