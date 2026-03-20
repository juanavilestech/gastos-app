import { getExpenses, createExpense, getCategories, askAI } from "./api";
import React, { useState, useEffect } from "react";
import "./App.css";
import { 
  Plus, 
  Search, 
  TrendingDown, 
  LayoutDashboard, 
  ListOrdered, 
  Menu,
  X,
  PlusCircle,
  BarChart3,
  Calendar,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Target,
  SendHorizonal,
  Bot,
  Sparkles
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const mockChartData = [
  { name: 'Lun', value: 0 },
  { name: 'Mar', value: 0 },
  { name: 'Mie', value: 0 },
  { name: 'Jue', value: 0 },
  { name: 'Vie', value: 0 },
  { name: 'Sab', value: 0 },
  { name: 'Dom', value: 0 },
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalType, setModalType] = useState('gasto');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [expensesData, categoriesData] = await Promise.all([
        getExpenses(),
        getCategories()
      ]);
      setExpenses(expensesData);
      setCategories(categoriesData);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const expenseData = {
      amount: parseFloat(formData.get("amount")),
      category: formData.get("category"),
      description: formData.get("description"),
      date: formData.get("date"),
      type: modalType,
    };

    try {
      const savedExpense = await createExpense(expenseData);
      setExpenses([savedExpense, ...expenses]);
      setShowAddModal(false);
      setModalType('gasto'); // Reset
    } catch (error) {
       alert("Error al guardar la transacción");
    }
  };

  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    const userMessage = { role: 'user', text: aiQuestion };
    setAiMessages(prev => [...prev, userMessage]);
    setAiQuestion('');
    setIsAiLoading(true);

    try {
      const response = await askAI(aiQuestion);
      const aiMessage = { role: 'ai', text: response.answer };
      setAiMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = { role: 'ai', text: 'Lo siento, no pude procesar tu pregunta. Intenta de nuevo.' };
      setAiMessages(prev => [...prev, errorMessage]);
    }

    setIsAiLoading(false);
  };

  const totalIncomes = expenses.filter(e => e.type === 'ingreso').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalExpenses = expenses.filter(e => e.type === 'gasto' || !e.type).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const balance = totalIncomes - totalExpenses;

  const getChartData = () => {
    if (expenses.length === 0) return mockChartData;
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const dataMap = dayNames.reduce((acc, day) => ({ ...acc, [day]: 0 }), {});
    
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const dayName = dayNames[date.getDay()];
      const multiplier = expense.type === 'ingreso' ? 1 : -1;
      dataMap[dayName] = (dataMap[dayName] || 0) + (Number(expense.amount) * multiplier);
    });

    return dayNames.slice(1).concat(dayNames[0]).map(name => ({
      name,
      value: dataMap[name]
    }));
  };

  const chartData = getChartData();

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return localDate.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const filteredCategories = categories.filter(c => c.type === modalType);

  return (
    <div className="app-container">
      <aside className="sidebar glass overflow-hidden">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon glow-purple">
                <Wallet size={24} color="#8b5cf6" />
            </div>
            <span className="logo-text gradient-text">GastosApp</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
            {activeTab === 'dashboard' && <motion.div layoutId="nav-active" className="nav-active-pill" />}
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            <ListOrdered size={20} />
            <span>Movimientos</span>
            {activeTab === 'expenses' && <motion.div layoutId="nav-active" className="nav-active-pill" />}
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <BarChart3 size={20} />
            <span>Reportes</span>
            {activeTab === 'reports' && <motion.div layoutId="nav-active" className="nav-active-pill" />}
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile glass">
             <div className="avatar">JU</div>
             <div className="user-info">
                <p className="user-name">Juan Carlos</p>
                <p className="user-plan">Plan Premium</p>
             </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div className="welcome-section">
            <h1 className="animate-fade-in">Bienvenido, Juan Carlos</h1>
            <p className="text-secondary">Controla tus finanzas con inteligencia.</p>
          </div>
          
          <div className="action-buttons">
            <button className="btn btn-primary glow-purple" onClick={() => setShowAddModal(true)}>
              <Plus size={20} />
              <span>Nueva Transacción</span>
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="dashboard-view animate-fade-in">
            <div className="stats-grid simplified">
               <motion.div whileHover={{ y: -5 }} className="stat-card glass incomes">
                 <div className="stat-icon-wrapper purple">
                    <ArrowUpRight size={24} />
                 </div>
                 <div className="stat-info">
                   <p className="text-secondary">Ingresos</p>
                   <h3>${totalIncomes.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</h3>
                 </div>
               </motion.div>

               <motion.div whileHover={{ y: -5 }} className="stat-card glass expenses">
                 <div className="stat-icon-wrapper rose">
                    <TrendingDown size={24} />
                 </div>
                 <div className="stat-info">
                   <p className="text-secondary">Gastos</p>
                   <h3>${totalExpenses.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</h3>
                 </div>
               </motion.div>

               <motion.div whileHover={{ y: -5 }} className="stat-card glass balance">
                 <div className="stat-icon-wrapper cyan">
                    <CreditCard size={24} />
                 </div>
                 <div className="stat-info">
                   <p className="text-secondary">Resumen</p>
                   <h3 style={{ color: balance >= 0 ? '#10b981' : '#f43f5e' }}>
                     ${balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                   </h3>
                 </div>
               </motion.div>
            </div>

            <div className="dashboard-grid">
               <div className="chart-section glass">
                 <div className="section-header">
                   <h2>Tendencia Diaria</h2>
                 </div>
                 <div className="chart-container" style={{ height: 300, width: '100%', minHeight: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis 
                          dataKey="name" 
                          stroke="#64748b" 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                           stroke="#64748b" 
                           fontSize={12}
                           tickLine={false}
                           axisLine={false}
                        />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#8b5cf6" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorValue)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
               </div>

               <div className="recent-activity glass">
                 <div className="section-header">
                   <h2>Últimos Movimientos</h2>
                   <button className="view-all" onClick={() => setActiveTab('expenses')}>Ver todos</button>
                 </div>
                 <div className="expense-list-mini">
                    {expenses.length === 0 ? (
                      <p className="no-data">No hay movimientos registrados.</p>
                    ) : (
                      expenses.slice(0, 4).map(expense => (
                        <div key={expense.id} className="mini-expense-item">
                          <div className={`expense-icon ${expense.type === 'ingreso' ? 'income' : 'expense'}`}>
                            {expense.type === 'ingreso' ? '+' : '-'}
                          </div>
                          <div className="expense-details">
                            <p className="expense-desc">{expense.description}</p>
                            <p className="expense-meta">{expense.category} • {formatDate(expense.date)}</p>
                          </div>
                          <p className={`expense-amount-mini ${expense.type === 'ingreso' ? 'income-text' : ''}`}>
                            {expense.type === 'ingreso' ? '+' : '-'}${Number(expense.amount || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      ))
                    )}
                 </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="expenses-view animate-fade-in">
            <div className="table-controls glass">
               <div className="search-box">
                  <Search size={18} />
                  <input type="text" placeholder="Buscar movimientos..." />
               </div>
               <div className="filters">
                  <select className="filter-select">
                    <option>Todo</option>
                    <option value="ingreso">Ingresos</option>
                    <option value="gasto">Gastos</option>
                  </select>
               </div>
            </div>

            <div className="expenses-table-container glass">
               <table className="expenses-table">
                 <thead>
                   <tr>
                     <th>Descripción</th>
                     <th>Categoría</th>
                     <th>Fecha</th>
                     <th>Monto</th>
                     <th>Tipo</th>
                   </tr>
                 </thead>
                 <tbody>
                    {expenses.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                          No se encontraron movimientos.
                        </td>
                      </tr>
                    ) : (
                      expenses.map(expense => (
                        <tr key={expense.id}>
                          <td>{expense.description}</td>
                          <td>{expense.category}</td>
                          <td>{formatDate(expense.date)}</td>
                          <td className={`amount-cell ${expense.type === 'ingreso' ? 'income-text' : ''}`}>
                            {expense.type === 'ingreso' ? '+' : '-'}${Number(expense.amount || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                          </td>
                          <td>
                            <span className={`type-badge ${expense.type === 'ingreso' ? 'income' : 'expense'}`}>
                              {expense.type}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                 </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-view animate-fade-in">
            <div className="ai-assistant-container glass">
              <div className="ai-header">
                <div className="ai-title">
                  <Sparkles size={24} className="ai-icon" />
                  <h2>Asistente Financiero IA</h2>
                </div>
                <p className="ai-subtitle">Pregunta sobre tus gastos en lenguaje natural</p>
              </div>

              <div className="ai-chat-container">
                {aiMessages.length === 0 && (
                  <div className="ai-suggestions">
                    <p className="suggestion-label">Preguntas sugeridas:</p>
                    <div className="suggestion-chips">
                      <button onClick={() => setAiQuestion('¿Cuánto gasté en total?')} className="chip">¿Cuánto gasté en total?</button>
                      <button onClick={() => setAiQuestion('¿Cuáles son mis categorías con más gastos?')} className="chip">¿Categorías con más gastos?</button>
                      <button onClick={() => setAiQuestion('¿Cómo está mi balance?')} className="chip">¿Cómo está mi balance?</button>
                      <button onClick={() => setAiQuestion('¿Qué me recomiendas para ahorrar?')} className="chip">¿Cómo ahorrar más?</button>
                    </div>
                  </div>
                )}

                <div className="ai-messages">
                  <AnimatePresence>
                    {aiMessages.map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`ai-message ${msg.role}`}
                      >
                        <div className="message-avatar">
                          {msg.role === 'ai' ? <Bot size={20} /> : <span>U</span>}
                        </div>
                        <div className="message-content">
                          {msg.text.split('\n').map((line, i) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {isAiLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="ai-message ai"
                    >
                      <div className="message-avatar"><Bot size={20} /></div>
                      <div className="message-content typing">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              <form onSubmit={handleAskAI} className="ai-input-form">
                <input
                  type="text"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder="Ej: ¿Cuánto gasté esta semana?"
                  className="ai-input"
                  disabled={isAiLoading}
                />
                <button type="submit" className="ai-send-btn" disabled={isAiLoading || !aiQuestion.trim()}>
                  <SendHorizontal size={20} />
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="modal-content glass glow-purple"
            >
              <div className="modal-header">
                <h2>Nueva Transacción</h2>
                <button className="close-btn" onClick={() => setShowAddModal(false)}>
                  <X />
                </button>
              </div>
              <form onSubmit={handleAddExpense} className="expense-form">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Tipo</label>
                    <div className="type-toggle">
                       <input 
                        type="radio" 
                        id="type-gasto" 
                        name="type" 
                        value="gasto" 
                        checked={modalType === 'gasto'} 
                        onChange={() => setModalType('gasto')}
                       />
                       <label htmlFor="type-gasto">Gasto</label>
                       <input 
                        type="radio" 
                        id="type-ingreso" 
                        name="type" 
                        value="ingreso" 
                        checked={modalType === 'ingreso'}
                        onChange={() => setModalType('ingreso')}
                       />
                       <label htmlFor="type-ingreso">Ingreso</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Monto</label>
                    <div className="input-with-icon">
                      <span className="currency">$</span>
                      <input name="amount" type="number" step="0.01" required placeholder="0.00" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Categoría</label>
                    <select name="category" required>
                      {filteredCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label>Descripción</label>
                    <input name="description" type="text" required placeholder="Ej: Sueldo o Supermercado" />
                  </div>
                  <div className="form-group full-width">
                    <label>Fecha</label>
                    <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary full-width glow-purple">
                  Guardar Transacción
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
