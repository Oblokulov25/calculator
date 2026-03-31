import React, { useState, useEffect, useCallback } from 'react';

const App = () => {
  // По умолчанию обычный режим (false)
  const [isExpanded, setIsExpanded] = useState(false);
  const [expression, setExpression] = useState('');
  const [time, setTime] = useState('');

  // 1. Обновление времени (24-часовой формат)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Ввод символов
  const append = useCallback((val) => {
    setExpression((prev) => prev + val);
  }, []);

  const clear = () => setExpression('');
  const backspace = () => setExpression((prev) => prev.slice(0, -1));

  // 3. Логика вычислений (Исправленные скобки и производительность)
  const calculate = () => {
    if (!expression) return;
    try {
      let str = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        // Исправление неявного умножения: 2(5) -> 2*(5)
        .replace(/(\d)(\()/g, '$1*(')
        .replace(/\)(\d)/g, ')*$1')
        .replace(/\)\(/g, ')*(')
        .replace(/(\d)(Math|e)/g, '$1*$2')
        // Математические функции
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log₁₀\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/√\(/g, 'Math.sqrt(')
        .replace(/\^/g, '**');

      // Автоматическое закрытие скобок
      const open = (str.match(/\(/g) || []).length;
      const close = (str.match(/\)/g) || []).length;
      str += ')'.repeat(Math.max(0, open - close));

      // Вычисление через безопасный конструктор Function
      const result = new Function(`return ${str}`)();
      
      // Форматирование результата
      const formatted = Number.isInteger(result) 
        ? result 
        : parseFloat(result.toPrecision(10));

      setExpression(String(formatted));
    } catch (error) {
      setExpression('Error');
      setTimeout(() => setExpression(''), 1200);
    }
  };

  const handleSci = (type) => {
    const map = {
      'x²': '**2', 'x³': '**3', 'xʸ': '^', 
      'sin': 'sin(', 'cos': 'cos(', 'tan': 'tan(', 
      'ln': 'ln(', 'log₁₀': 'log₁₀(', '²√': '√('
    };
    setExpression(prev => prev + (map[type] || type));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#050505] p-4 font-sans select-none antialiased overflow-hidden">
      {/* Контейнер калькулятора */}
      <div className={`relative bg-black rounded-[50px] p-6 shadow-2xl border border-white/10 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
        isExpanded ? 'w-full max-w-[940px]' : 'w-[360px]'
      }`}>
        
        {/* Верхняя панель: Кнопка режима и Время */}
        <div className="flex justify-between items-center mb-4 px-2">
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="text-[#ff9f0a] w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-900/80 active:scale-90 transition-all border border-white/5"
          >
            {isExpanded ? (
              <span className="text-2xl font-light">✕</span>
            ) : (
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 8h16M4 16h16" /></svg>
            )}
          </button>
          <span className="text-white text-xl font-bold tracking-tighter">{time}</span>
        </div>

        {/* Экран (Display) */}
        <div className="h-40 flex flex-col justify-end items-end px-4 mb-6 border-b border-white/5 pb-4">
          <div className={`text-white font-light tracking-tighter text-right w-full transition-all duration-300 break-all overflow-hidden ${
            expression.length > 10 ? 'text-4xl' : isExpanded ? 'text-8xl' : 'text-7xl'
          }`}>
            {expression || ""}
          </div>
        </div>

        {/* Сетка кнопок */}
        <div className="flex gap-4">
          {/* Инженерная панель (Скрыта в обычном режиме) */}
          <div className={`grid grid-cols-6 gap-2 transition-all duration-700 ${
            isExpanded ? 'w-[62%] opacity-100' : 'w-0 opacity-0 invisible -translate-x-10'
          }`}>
            {['(', ')', 'mc', 'm+', 'm-', 'mr', '2nd', 'x²', 'x³', 'xʸ', 'eˣ', '10ˣ', '1/x', '²√', '³√', 'ʸ√x', 'ln', 'log₁₀', 'sin', 'cos', 'tan', 'e', 'EE', 'Rad', 'sinh', 'cosh', 'tanh', 'π', 'Rand'].map(btn => (
              <button 
                key={btn} 
                onClick={() => ['(', ')', 'π', 'e'].includes(btn) ? append(btn) : handleSci(btn)}
                className="h-11 bg-zinc-800/70 text-white rounded-2xl text-[13px] font-semibold hover:bg-zinc-700 active:bg-zinc-500 transition-all border border-white/5 shadow-inner"
              >
                {btn}
              </button>
            ))}
          </div>

          {/* Стандартная панель */}
          <div className={`grid grid-cols-4 gap-3 ${isExpanded ? 'w-[38%]' : 'w-full'}`}>
            <button onClick={clear} className="h-11 bg-[#a5a5a5] text-black rounded-2xl text-lg font-bold active:bg-zinc-300">AC</button>
            <button onClick={backspace} className="h-11 bg-[#a5a5a5] text-black rounded-2xl text-lg font-bold active:bg-zinc-300">⌫</button>
            <button onClick={() => append('%')} className="h-11 bg-[#a5a5a5] text-black rounded-2xl text-lg font-bold active:bg-zinc-300">%</button>
            <button onClick={() => append('÷')} className="h-11 bg-[#ff9f0a] text-white rounded-2xl text-2xl font-bold active:bg-orange-300">÷</button>

            {[7, 8, 9].map(n => <NumBtn key={n} label={n} onClick={() => append(n)} />)}
            <button onClick={() => append('×')} className="h-11 bg-[#ff9f0a] text-white rounded-2xl text-2xl font-bold active:bg-orange-300">×</button>

            {[4, 5, 6].map(n => <NumBtn key={n} label={n} onClick={() => append(n)} />)}
            <button onClick={() => append('-')} className="h-11 bg-[#ff9f0a] text-white rounded-2xl text-3xl font-bold active:bg-orange-300">-</button>

            {[1, 2, 3].map(n => <NumBtn key={n} label={n} onClick={() => append(n)} />)}
            <button onClick={() => append('+')} className="h-11 bg-[#ff9f0a] text-white rounded-2xl text-2xl font-bold active:bg-orange-300">+</button>

            <button onClick={() => append('0')} className="col-span-2 h-11 bg-[#262626] text-white rounded-2xl text-xl font-bold active:bg-zinc-600 transition-all">0</button>
            <button onClick={() => append('.')} className="h-11 bg-[#262626] text-white rounded-2xl text-xl font-bold active:bg-zinc-600">.</button>
            <button onClick={calculate} className="h-11 bg-[#ff9f0a] text-white rounded-2xl text-2xl font-bold active:bg-white">=</button>
          </div>
        </div>

        {/* Нижний отступ (без полосы) */}
        <div className="h-4"></div>
      </div>
    </div>
  );
};

// Компонент цифровой кнопки
const NumBtn = ({ label, onClick }) => (
  <button 
    onClick={onClick} 
    className="h-11 bg-[#262626] text-white rounded-2xl text-xl font-bold active:bg-zinc-600 transition-all border border-white/5 shadow-md"
  >
    {label}
  </button>
);

export default App;
