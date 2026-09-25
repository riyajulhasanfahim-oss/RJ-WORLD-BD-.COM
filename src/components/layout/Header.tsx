import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, Menu, X, MapPin, Globe, Heart, LogOut, MessageSquare, Bell } from 'lucide-react';
import { rtdbSubscribe } from '../../lib/rtdb';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationBox from '../notifications/NotificationBox';
import { motion, AnimatePresence } from 'motion/react';
import ProfessionalSearch from './ProfessionalSearch';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const { t, i18n } = useTranslation();
  const { user, userData, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { unreadCount } = useNotifications();
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = rtdbSubscribe<any>('chats', (snap) => {
      let count = 0;
      if (snap) {
        const isVendor = String(userData?.role || '').toLowerCase() === 'vendor';
        Object.keys(snap).forEach(key => {
          const data = snap[key];
          if (!data) return;
          if (isVendor && data.vendorId === user.uid) {
            count += Number(data.unreadCountVendor) || 0;
          } else if (!isVendor && (data.customerId === user.uid || data.userId === user.uid)) {
            count += Number(data.unreadCountCustomer) || 0;
          }
        });
      }
      setChatUnreadCount(count);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.uid, userData?.role]);
  const navigate = useNavigate();

  const wishlistCount = wishlistItems.length;

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'bn' : 'en');
  };

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group">
              <span className="text-lg sm:text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-main to-sky-600 tracking-tight">
                RJ WORLD BD
              </span>
              <div className="relative flex items-center justify-center ml-0.5">
                <img 
                  referrerPolicy="no-referrer"
                  src="https://i.postimg.cc/02BC9ZMs/file-00000000c36881fa822edc96c75d817a.png" 
                  alt="RJ WORLD BD Logo"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                  className="w-[28px] h-[28px] md:w-[36px] md:h-[36px] object-contain relative z-10"
                />
              </div>
            </Link>
          </div>

          {/* Search Box - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <ProfessionalSearch className="w-full" placeholder={t('Search products...')} />
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center text-slate-600 hover:text-primary-main cursor-pointer transition-colors">
              <MapPin className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">Dhaka</span>
            </div>
            
            <button 
              onClick={toggleLanguage}
              className="flex items-center text-slate-600 hover:text-primary-main transition-colors"
            >
              <Globe className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">{i18n.language === 'en' ? 'BN' : 'EN'}</span>
            </button>

            {/* Notification Bell (Directly to the left of Wishlist) */}
            {user && (
              <div className="relative">
                <button 
                  type="button"
                  data-notification-trigger="true"
                  onClick={() => setIsNotificationOpen(prev => !prev)}
                  className="relative p-1.5 text-slate-600 hover:text-primary-main hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                  title="নোটিফিকেশন"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow-xs animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                {isDesktop && (
                  <NotificationBox
                    isOpen={isNotificationOpen}
                    onClose={() => setIsNotificationOpen(false)}
                  />
                )}
              </div>
            )}

            <Link to="/wishlist" className="relative text-slate-600 hover:text-primary-main transition-colors">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-main text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative text-slate-600 hover:text-primary-main transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary-main text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-3 sm:space-x-4">
                {isAdmin && (
                  <Link to="/admin/dashboard" className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-full hover:bg-slate-800 transition-colors">
                    Admin Panel
                  </Link>
                )}
                <Link to="/orders" className="flex items-center text-slate-600 hover:text-primary-main transition-colors">
                  <span className="text-sm font-medium">Orders</span>
                </Link>
                <Link to={(userData?.role === 'Vendor' && userData?.hasActiveVendor) ? '/vendor-dashboard' : (userData?.role === 'Reseller' && userData?.hasActiveReseller) ? '/reseller/dashboard' : '/dashboard'} className="flex items-center text-slate-600 hover:text-primary-main transition-colors">
                  <UserIcon className="h-5 w-5 mr-1" />
                  <span className="text-sm font-medium">{userData?.name?.split(' ')[0] || 'Account'}</span>
                </Link>
                <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-white bg-primary-main hover:bg-sky-600 rounded-full transition-colors shadow-sm">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-3">
            {user && (
              <div className="relative">
                <button 
                  type="button"
                  data-notification-trigger="true"
                  onClick={() => setIsNotificationOpen(prev => !prev)}
                  className="relative p-1 text-slate-600 hover:text-primary-main flex items-center justify-center cursor-pointer"
                  title="নোটিফিকেশন"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] px-0.5 flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                {!isDesktop && (
                  <NotificationBox
                    isOpen={isNotificationOpen}
                    onClose={() => setIsNotificationOpen(false)}
                  />
                )}
              </div>
            )}

            <Link to="/wishlist" className="relative text-slate-600">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-main text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative text-slate-600">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary-main text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 hover:text-primary-main focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Search Box - Mobile */}
        <div className="md:hidden pb-2">
          <ProfessionalSearch className="w-full" placeholder={t('Search products...')} />
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-200"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <div className="flex items-center text-slate-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>Dhaka</span>
                </div>
                <button onClick={toggleLanguage} className="flex items-center text-slate-600">
                  <Globe className="h-5 w-5 mr-2" />
                  <span>{i18n.language === 'en' ? 'বাংলা' : 'English'}</span>
                </button>
              </div>
              
              {user ? (
                <>
                  <Link 
                    to="/notifications" 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="flex items-center justify-between py-3 text-base font-medium text-slate-900 border-b border-slate-100"
                  >
                    <div className="flex items-center">
                      <Bell className="h-5 w-5 mr-2 text-primary-main" />
                      নোটিফিকেশন
                    </div>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-600 rounded-full">
                        {unreadCount}টি নতুন
                      </span>
                    )}
                  </Link>

                  {isAdmin && (
                    <Link to="/admin/dashboard" className="block py-3 text-base font-bold text-slate-900 border-b border-slate-100">
                      <div className="flex items-center">
                        Admin Panel
                      </div>
                    </Link>
                  )}
                  <Link to="/orders" className="block py-3 text-base font-medium text-slate-900 border-b border-slate-100">
                    <div className="flex items-center">
                      Orders
                    </div>
                  </Link>
                  <Link to={(userData?.role === 'Vendor' && userData?.hasActiveVendor) ? '/vendor-dashboard' : (userData?.role === 'Reseller' && userData?.hasActiveReseller) ? '/reseller/dashboard' : '/dashboard'} className="block py-3 text-base font-medium text-slate-900 border-b border-slate-100">
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 mr-2" />
                      Dashboard
                    </div>
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left py-3 text-base font-medium text-red-600">
                    <div className="flex items-center">
                      <LogOut className="h-5 w-5 mr-2" />
                      Logout
                    </div>
                  </button>
                </>
              ) : (
                <div className="pt-4 space-y-2">
                  <Link to="/login" className="block w-full text-center px-4 py-2 text-base font-medium text-primary-main bg-primary-main/10 rounded-lg">
                    Sign In
                  </Link>
                  <Link to="/register" className="block w-full text-center px-4 py-2 text-base font-medium text-white bg-primary-main rounded-lg">
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
