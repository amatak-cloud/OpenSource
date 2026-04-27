// layouts/MainLayout.jsx
import React from 'react';
import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import Footer from '../components/Footer/Footer';

function MainLayout({ 
  children, 
  currentPage, 
  setCurrentPage, 
  currentUser, 
  sidebarCollapsed, 
  setSidebarCollapsed,
  toggleTheme,
  theme
}) {
  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Header 
        currentUser={currentUser}
        toggleTheme={toggleTheme}
        theme={theme}
        setCurrentPage={setCurrentPage}
      />
      <div className="layout-main">
        <Sidebar 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          currentUser={currentUser}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
        <main className="main-content">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default MainLayout;