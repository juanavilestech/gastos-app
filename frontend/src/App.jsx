import {
  getExpenses,
  createExpense,
  getCategories,
  askAI,
  getAIAnalysis,
  predictCategory,
  retrainAI,
} from "./api";
import React, { useState, useEffect, useRef } from "react";
import Login from "./Login";
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
  Sparkles,
  LogOut,
  AlertCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const mockChartData = [
  { name: "Lun", value: 0 },
  { name: "Mar", value: 0 },
  { name: "Mie", value: 0 },
  { name: "Jue", value: 0 },
  { name: "Vie", value: 0 },
  { name: "Sab", value: 0 },
  { name: "Dom", value: 0 },
];

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddModal, setShowAddModal] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [aiAudits, setAiAudits] = useState({});
  const [isAuditing, setIsAuditing] = useState(false);
  const [showRetrainModal, setShowRetrainModal] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [manualTrainingType, setManualTrainingType] = useState("gasto");
  const [modalType, setModalType] = useState("gasto");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiMessages, setAiMessages] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [aiAnalysis, setAiAnalysis] = useState(null);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (activeTab === "reports") {
      scrollToBottom();
    }
  }, [aiMessages, isAiLoading, activeTab]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoggedIn) return;
      setIsLoading(true);
      try {
        const [expensesData, categoriesData, analysisData] = await Promise.all([
          getExpenses(),
          getCategories(),
          getAIAnalysis(),
        ]);
        setExpenses(expensesData);
        setCategories(categoriesData);
        setAiAnalysis(analysisData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [isLoggedIn]);

  useEffect(() => {
    if (activeTab === "ai-training" && expenses.length > 0) {
      const auditExpenses = async () => {
        setIsAuditing(true);
        const audits = {};
        // Audit first 15
        const toAudit = expenses.slice(0, 15);
        for (const exp of toAudit) {
          try {
            const pred = await predictCategory(exp.description);
            audits[exp.id] = pred;
          } catch (e) {
            console.error("Audit error", e);
          }
        }
        setAiAudits(audits);
        setIsAuditing(false);
      };
      auditExpenses();
    }
  }, [activeTab, expenses]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
  };

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
      setModalType("gasto"); // Reset
    } catch (error) {
      alert("Error al guardar la transacción");
    }
  };

  const handleAskAI = async (e, directQuestion = null) => {
    if (e) e.preventDefault();
    const questionToAsk = directQuestion || aiQuestion;
    if (!questionToAsk.trim()) return;

    const userMessage = { role: "user", text: questionToAsk };
    setAiMessages((prev) => [...prev, userMessage]);
    if (!directQuestion) setAiQuestion("");
    setIsAiLoading(true);

    try {
      const response = await askAI(questionToAsk);
      const aiMessage = { role: "ai", text: response.answer };
      setAiMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        role: "ai",
        text: "Lo siento, no pude procesar tu pregunta. Intenta de nuevo.",
      };
      setAiMessages((prev) => [...prev, errorMessage]);
    }

    setIsAiLoading(false);
  };

  const handleRetrain = async () => {
    setIsAiLoading(true);
    try {
      await retrainAI();
      const [newExpenses, newAnalysis] = await Promise.all([
        getExpenses(),
        getAIAnalysis(),
      ]);
      setExpenses(newExpenses);
      setAiAnalysis(newAnalysis);
      setShowRetrainModal(true);
    } catch (error) {
      alert("Error al reentrenar el modelo.");
    }
    setIsAiLoading(false);
  };

  const [isPredicting, setIsPredicting] = useState(false);
  const handleAutoCategory = async (description) => {
    if (!description || description.length < 3) return;
    setIsPredicting(true);
    try {
      const result = await predictCategory(description);
      if (result && result.predicted_category) {
        // First set the type if it differs
        if (result.predicted_type && result.predicted_type !== modalType) {
          setModalType(result.predicted_type);
        }

        // Wait for state update is not needed for DOM selection but we should update the value
        setTimeout(() => {
          const categorySelect = document.querySelector(
            'select[name="category"]',
          );
          if (categorySelect) {
            categorySelect.value = result.predicted_category;
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error predicting category");
    }
    setIsPredicting(false);
  };

  const totalIncomes = expenses
    .filter((e) => e.type === "ingreso")
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalExpenses = expenses
    .filter((e) => e.type === "gasto" || !e.type)
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const balance = totalIncomes - totalExpenses;

  const [chartView, setChartView] = useState("month");

  const getChartData = () => {
    if (expenses.length === 0) return mockChartData;

    const dataMap = {};
    const now = new Date();

    if (chartView === "week") {
      const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const key = d.toISOString().split("T")[0];
        dataMap[key] = {
          name: dayNames[d.getDay()],
          value: 0,
          timestamp: d.getTime(),
        };
      }

      expenses.forEach((expense) => {
        const d = new Date(expense.date);
        const key = d.toISOString().split("T")[0];
        if (dataMap[key]) {
          const multiplier = expense.type === "ingreso" ? 1 : -1;
          dataMap[key].value += Number(expense.amount) * multiplier;
        }
      });
    } else if (chartView === "month") {
      const monthNames = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ];
      expenses.forEach((expense) => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const multiplier = expense.type === "ingreso" ? 1 : -1;

        if (!dataMap[monthKey]) {
          dataMap[monthKey] = {
            name: monthNames[date.getMonth()],
            value: 0,
            timestamp: new Date(
              date.getFullYear(),
              date.getMonth(),
              1,
            ).getTime(),
          };
        }
        dataMap[monthKey].value += Number(expense.amount) * multiplier;
      });
    } else if (chartView === "year") {
      expenses.forEach((expense) => {
        const date = new Date(expense.date);
        const yearKey = date.getFullYear().toString();
        const multiplier = expense.type === "ingreso" ? 1 : -1;

        if (!dataMap[yearKey]) {
          dataMap[yearKey] = {
            name: yearKey,
            value: 0,
            timestamp: new Date(date.getFullYear(), 0, 1).getTime(),
          };
        }
        dataMap[yearKey].value += Number(expense.amount) * multiplier;
      });
    }

    return Object.values(dataMap)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(({ name, value }) => ({ name, value }));
  };

  const chartData = getChartData();

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const localDate = new Date(
      date.getTime() + date.getTimezoneOffset() * 60000,
    );
    return localDate.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const filteredCategories = categories.filter((c) => c.type === modalType);

  if (!isLoggedIn) {
    return <Login onLogin={handleLoginSuccess} />;
  }

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
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
            {activeTab === "dashboard" && (
              <motion.div layoutId="nav-active" className="nav-active-pill" />
            )}
          </button>

          <button
            className={`nav-item ${activeTab === "expenses" ? "active" : ""}`}
            onClick={() => setActiveTab("expenses")}
          >
            <ListOrdered size={20} />
            <span>Movimientos</span>
            {activeTab === "expenses" && (
              <motion.div layoutId="nav-active" className="nav-active-pill" />
            )}
          </button>
          <button
            className={`nav-item ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            <Bot size={20} />
            <span>Asistente IA</span>
            {activeTab === "reports" && (
              <motion.div layoutId="nav-active" className="nav-active-pill" />
            )}
          </button>
          <button
            className={`nav-item ${activeTab === "ai-training" ? "active" : ""}`}
            onClick={() => setActiveTab("ai-training")}
          >
            <Sparkles size={20} />
            <span>Entrenador IA</span>
            {activeTab === "ai-training" && (
              <motion.div layoutId="nav-active" className="nav-active-pill" />
            )}
          </button>
        </nav>

        <div className="logout-nav">
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div className="welcome-section">
            <h1 className="animate-fade-in">
              Bienvenido, {user?.name || "Juan Aviles"}
            </h1>
            <p className="text-secondary">
              Controla tus finanzas con inteligencia.
            </p>
          </div>

          <div className="action-buttons">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const question = e.target.quickAsk.value;
                if (!question) return;
                setAiQuestion(question);
                setActiveTab("reports");
                handleAskAI(e, question);
                e.target.quickAsk.value = "";
              }}
              className="ai-quick-ask"
            >
              <Sparkles size={18} className="ask-icon" />
              <input
                name="quickAsk"
                type="text"
                placeholder="Pregunta a la IA..."
                autoComplete="off"
              />
            </form>
            <button
              className="btn btn-primary glow-purple"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={20} />
              <span>Nueva Transacción</span>
            </button>
          </div>
        </header>

        {activeTab === "dashboard" && (
          <div className="dashboard-view animate-fade-in">
            <div className="stats-grid simplified">
              <motion.div
                whileHover={{ y: -5 }}
                className="stat-card glass incomes"
              >
                <div className="stat-icon-wrapper purple">
                  <ArrowUpRight size={24} />
                </div>
                <div className="stat-info">
                  <p className="text-secondary">Ingresos</p>
                  <h3>
                    $
                    {totalIncomes.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </h3>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="stat-card glass expenses"
              >
                <div className="stat-icon-wrapper rose">
                  <TrendingDown size={24} />
                </div>
                <div className="stat-info">
                  <p className="text-secondary">Gastos</p>
                  <h3>
                    $
                    {totalExpenses.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </h3>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="stat-card glass balance"
              >
                <div className="stat-icon-wrapper cyan">
                  <CreditCard size={24} />
                </div>
                <div className="stat-info">
                  <p className="text-secondary">Resumen</p>
                  <h3 style={{ color: balance >= 0 ? "#10b981" : "#f43f5e" }}>
                    $
                    {balance.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}
                  </h3>
                </div>
              </motion.div>
            </div>

            <div className="dashboard-grid">
              {aiAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="ai-insights-card glass glow-purple-subtle"
                >
                  <div className="ai-insight-header">
                    <Sparkles size={20} className="ai-sparkle" />
                    <h3>Consejo de la IA</h3>
                  </div>
                  <div className="ai-insight-body">
                    {aiAnalysis.advice ? (
                      <p>{aiAnalysis.advice}</p>
                    ) : (
                      <p>
                        No hay suficientes datos para generar consejos. ¡Sigue
                        registrando tus gastos!
                      </p>
                    )}
                    {aiAnalysis.projected_end_of_month > 0 && (
                      <div className="projection-badge">
                        <span>Proyección mes: </span>
                        <strong>
                          $
                          {aiAnalysis.projected_end_of_month.toLocaleString(
                            "es-ES",
                            { maximumFractionDigits: 0 },
                          )}
                        </strong>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              <div className="chart-section glass">
                <div className="section-header">
                  <h2>
                    Tendencia{" "}
                    {chartView === "week"
                      ? "Semanal"
                      : chartView === "month"
                        ? "Mensual"
                        : "Anual"}
                  </h2>
                  <div className="time-filters">
                    <button
                      className={`small-filter ${chartView === "week" ? "active" : ""}`}
                      onClick={() => setChartView("week")}
                    >
                      Semana
                    </button>
                    <button
                      className={`small-filter ${chartView === "month" ? "active" : ""}`}
                      onClick={() => setChartView("month")}
                    >
                      Mes
                    </button>
                    <button
                      className={`small-filter ${chartView === "year" ? "active" : ""}`}
                      onClick={() => setChartView("year")}
                    >
                      Año
                    </button>
                  </div>
                </div>
                <div
                  className="chart-container"
                  style={{ height: 300, width: "100%", minHeight: 300 }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient
                          id="colorValue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8b5cf6"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8b5cf6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.05)"
                      />
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
                  <button
                    className="view-all"
                    onClick={() => setActiveTab("expenses")}
                  >
                    Ver todos
                  </button>
                </div>
                <div className="expense-list-mini">
                  {expenses.length === 0 ? (
                    <p className="no-data">No hay movimientos registrados.</p>
                  ) : (
                    expenses.slice(0, 4).map((expense) => (
                      <div key={expense.id} className="mini-expense-item">
                        <div
                          className={`expense-icon ${expense.type === "ingreso" ? "income" : "expense"}`}
                        >
                          {expense.type === "ingreso" ? "+" : "-"}
                        </div>
                        <div className="expense-details">
                          <p className="expense-desc">{expense.description}</p>
                          <p className="expense-meta">
                            {expense.category} • {formatDate(expense.date)}
                          </p>
                        </div>
                        <p
                          className={`expense-amount-mini ${expense.type === "ingreso" ? "income-text" : ""}`}
                        >
                          {expense.type === "ingreso" ? "+" : "-"}$
                          {Number(expense.amount || 0).toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "expenses" && (
          <div className="expenses-view animate-fade-in">
            <div className="table-controls glass">
              <div className="search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Buscar movimientos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="filters">
                <select
                  className="filter-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">Todo</option>
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
                  {expenses.filter((e) => {
                    const matchesType =
                      filterType === "all" || e.type === filterType;
                    const matchesSearch = e.description
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase());
                    return matchesType && matchesSearch;
                  }).length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          textAlign: "center",
                          padding: "2rem",
                          color: "#64748b",
                        }}
                      >
                        No se encontraron movimientos.
                      </td>
                    </tr>
                  ) : (
                    expenses
                      .filter((e) => {
                        const matchesType =
                          filterType === "all" || e.type === filterType;
                        const matchesSearch = e.description
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase());
                        return matchesType && matchesSearch;
                      })
                      .map((expense) => (
                        <tr key={expense.id}>
                          <td>{expense.description}</td>
                          <td>{expense.category}</td>
                          <td>{formatDate(expense.date)}</td>
                          <td
                            className={`amount-cell ${expense.type === "ingreso" ? "income-text" : ""}`}
                          >
                            {expense.type === "ingreso" ? "+" : "-"}$
                            {Number(expense.amount || 0).toLocaleString(
                              "es-AR",
                              {
                                minimumFractionDigits: 2,
                              },
                            )}
                          </td>
                          <td>
                            <span
                              className={`type-badge ${expense.type === "ingreso" ? "income" : "expense"}`}
                            >
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

        {activeTab === "reports" && (
          <div className="reports-view animate-fade-in">
            <div className="ai-assistant-container glass">
              <div className="ai-header">
                <div className="ai-title">
                  <Sparkles size={24} className="ai-icon" />
                  <h2>Asistente Financiero IA</h2>
                </div>
                <p className="ai-subtitle">
                  Pregunta sobre tus gastos en lenguaje natural
                </p>
                <div className="ai-buttons">
                  <button
                    className="btn-clear"
                    onClick={() => setAiMessages([])}
                    title="Limpiar chat"
                  >
                    <X size={14} />
                    <span>Limpiar Chat</span>
                  </button>
                  <button
                    className="btn-retrain"
                    onClick={handleRetrain}
                    disabled={isAiLoading}
                  >
                    <Bot size={14} />
                    <span>Reentrenar IA</span>
                  </button>
                </div>
              </div>

              <div className="ai-chat-container">
                {aiMessages.length === 0 && (
                  <div className="ai-suggestions">
                    <p className="suggestion-label">Preguntas sugeridas:</p>
                    <div className="suggestion-chips">
                      <button
                        onClick={(e) =>
                          handleAskAI(e, "¿Cuánto gasté en total?")
                        }
                        className="chip"
                      >
                        ¿Cuánto gasté en total?
                      </button>
                      <button
                        onClick={(e) =>
                          handleAskAI(
                            e,
                            "¿Cuáles son mis categorías con más gastos?",
                          )
                        }
                        className="chip"
                      >
                        ¿Categorías con más gastos?
                      </button>
                      <button
                        onClick={(e) =>
                          handleAskAI(e, "¿Cómo está mi balance?")
                        }
                        className="chip"
                      >
                        ¿Cómo está mi balance?
                      </button>
                      <button
                        onClick={(e) =>
                          handleAskAI(e, "¿Qué me recomiendas para ahorrar?")
                        }
                        className="chip"
                      >
                        ¿Cómo ahorrar más?
                      </button>
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
                          {msg.role === "ai" ? (
                            <Bot size={20} />
                          ) : (
                            <span>U</span>
                          )}
                        </div>
                        <div className="message-content">
                          {msg.text.split("\n").map((line, i) => (
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
                      <div className="message-avatar">
                        <Bot size={20} />
                      </div>
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
                <button
                  type="submit"
                  className="ai-send-btn"
                  disabled={isAiLoading || !aiQuestion.trim()}
                >
                  <SendHorizonal size={20} />
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "ai-training" && (
          <div className="ai-training-view animate-fade-in">
            <div className="section-header-row">
              <div className="text-content">
                <h2>Centro de Entrenamiento IA</h2>
                <p className="text-secondary">
                  Encuentra y corrige fallas en la categorización automática.
                </p>
              </div>
              <button
                className="btn btn-primary glow-purple"
                onClick={handleRetrain}
                disabled={isAiLoading}
              >
                {isAiLoading ? "Entrenando..." : "Sincronizar y Reentrenar"}
              </button>
            </div>

            <div
              className="manual-training-form glass"
              style={{ marginBottom: "2rem", padding: "1.5rem" }}
            >
              <h3 style={{ marginBottom: "0.5rem" }}>
                Agregar Ejemplo de Entrenamiento
              </h3>
              <p
                className="text-secondary"
                style={{ marginBottom: "1rem", fontSize: "0.9rem" }}
              >
                Enseña a la IA exactamente cómo clasificar una descripción.
              </p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const desc = formData.get("desc");
                  const cat = formData.get("cat");
                  const type = formData.get("type");

                  try {
                    await createExpense({
                      amount: 0.01,
                      description: desc,
                      category: cat,
                      type: type,
                      date: new Date().toISOString().split("T")[0],
                    });
                    alert(
                      `Ejemplo de "${desc}" guardado as "${cat}". Ahora haz clic en "Sincronizar y Reentrenar".`,
                    );
                    // Refresh expenses to see it if needed
                  } catch (err) {
                    alert("Error al guardar ejemplo");
                  }
                }}
                style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
              >
                <input
                  name="desc"
                  placeholder="Ej: Pago Freelance"
                  required
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                  }}
                />
                <select
                  name="type"
                  required
                  value={manualTrainingType}
                  onChange={(e) => setManualTrainingType(e.target.value)}
                  style={{
                    padding: "0.75rem",
                    borderRadius: "10px",
                    background: "rgba(0,0,0,0.2)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <option value="gasto">Gasto</option>
                  <option value="ingreso">Ingreso</option>
                </select>
                <select
                  name="cat"
                  required
                  style={{
                    padding: "0.75rem",
                    borderRadius: "10px",
                    background: "rgba(0,0,0,0.2)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {categories
                    .filter((c) => c.type === manualTrainingType)
                    .map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                </select>
                <button type="submit" className="btn btn-secondary">
                  Guardar Ejemplo
                </button>
              </form>
            </div>

            <div className="training-grid glass">
              <div className="table-header-info">
                <h3>Últimos Movimientos vs IA</h3>
                <p>
                  Verde = IA coincide | Rojo = IA clasificaría distinto (falla
                  potencial)
                </p>
              </div>
              <div className="training-table-container">
                <table className="training-table">
                  <thead>
                    <tr>
                      <th>Descripción</th>
                      <th>Categoría Actual</th>
                      <th>Tipo</th>
                      <th>Recomendación IA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.slice(0, 15).map((expense) => {
                      // This is a bit expensive to do in render, but it's for the training tab only
                      return (
                        <tr key={expense.id}>
                          <td>{expense.description}</td>
                          <td>
                            <span className="badge-category">
                              {expense.category}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`type-badge ${expense.type === "ingreso" ? "income" : "expense"}`}
                            >
                              {expense.type}
                            </span>
                          </td>
                          <td className="ai-feedback-cell">
                            {isAuditing ? (
                              <span className="text-secondary">
                                Auditando...
                              </span>
                            ) : aiAudits[expense.id] ? (
                              <span
                                className={
                                  aiAudits[expense.id].predicted_category ===
                                  expense.category
                                    ? "ai-match"
                                    : "ai-mismatch"
                                }
                              >
                                {aiAudits[expense.id].predicted_category}
                                {aiAudits[expense.id].predicted_category ===
                                expense.category ? (
                                  <Sparkles
                                    size={14}
                                    style={{ marginLeft: 8 }}
                                  />
                                ) : (
                                  <AlertCircle
                                    size={14}
                                    style={{ marginLeft: 8 }}
                                  />
                                )}
                              </span>
                            ) : (
                              <span className="text-secondary">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
                <button
                  className="close-btn"
                  onClick={() => setShowAddModal(false)}
                >
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
                        checked={modalType === "gasto"}
                        onChange={() => setModalType("gasto")}
                      />
                      <label htmlFor="type-gasto">Gasto</label>
                      <input
                        type="radio"
                        id="type-ingreso"
                        name="type"
                        value="ingreso"
                        checked={modalType === "ingreso"}
                        onChange={() => setModalType("ingreso")}
                      />
                      <label htmlFor="type-ingreso">Ingreso</label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Monto</label>
                    <div className="input-with-icon">
                      <span className="currency">$</span>
                      <input
                        name="amount"
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Categoría</label>
                    <select name="category" required>
                      {filteredCategories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label>Descripción</label>
                    <div className="input-with-button">
                      <input
                        name="description"
                        type="text"
                        required
                        placeholder="Ej: Sueldo o Supermercado"
                        onChange={(e) => {
                          if (e.target.value.length > 3) {
                            // Consider adding a debounce or a specific button
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn-magic"
                        onClick={() => {
                          const desc = document.querySelector(
                            'input[name="description"]',
                          ).value;
                          handleAutoCategory(desc);
                        }}
                        disabled={isPredicting}
                      >
                        {isPredicting ? "..." : <Sparkles size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label>Fecha</label>
                    <input
                      name="date"
                      type="date"
                      required
                      defaultValue={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary full-width glow-purple"
                >
                  Guardar Transacción
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRetrainModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowRetrainModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="modal-content glass success-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="success-icon-wrapper">
                <Sparkles size={48} color="#8b5cf6" />
              </div>
              <h2>¡Aprendizaje Completado!</h2>
              <p className="text-secondary">
                He procesado tus nuevos movimientos y corregido mis patrones.
                Ahora soy más preciso categorizando tus finanzas.
              </p>
              <button
                className="btn btn-primary full-width"
                onClick={() => setShowRetrainModal(false)}
              >
                Genial, continuar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
