// =====================================
// Calculator Class - Clean Architecture
// =====================================

class ScientificCalculator {
    constructor() {
        this.displayPrimary = document.getElementById('displayPrimary');
        this.displaySecondary = document.getElementById('displaySecondary');
        this.memoryIndicator = document.getElementById('memoryIndicator');
        
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.waitingForOperand = false;
        this.memory = 0;
        this.history = [];
        this.angleMode = 'deg'; // deg or rad
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadHistory();
        this.updateDisplay();
    }
    
    setupEventListeners() {
        // Number buttons
        document.querySelectorAll('[data-number]').forEach(btn => {
            btn.addEventListener('click', () => this.inputNumber(btn.dataset.number));
        });
        
        // Operator buttons
        document.querySelectorAll('[data-operator]').forEach(btn => {
            btn.addEventListener('click', () => this.inputOperator(btn.dataset.operator));
        });
        
        // Function buttons
        document.querySelectorAll('[data-function]').forEach(btn => {
            btn.addEventListener('click', () => this.executeFunction(btn.dataset.function));
        });
        
        // Action buttons
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => this.executeAction(btn.dataset.action));
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    // =====================================
    // Input Handlers
    // =====================================
    
    inputNumber(num) {
        if (this.waitingForOperand) {
            this.currentValue = String(num);
            this.waitingForOperand = false;
        } else {
            if (num === '.' && this.currentValue.includes('.')) return;
            this.currentValue = this.currentValue === '0' ? String(num) : this.currentValue + num;
        }
        this.updateDisplay();
    }
    
    inputOperator(op) {
        const value = parseFloat(this.currentValue);
        
        if (this.previousValue === '') {
            this.previousValue = value;
        } else if (this.operation) {
            const result = this.calculate(this.previousValue, value, this.operation);
            
            if (result === 'Error') {
                this.showError('خطا در محاسبه');
                return;
            }
            
            this.currentValue = String(result);
            this.previousValue = result;
        }
        
        this.waitingForOperand = true;
        this.operation = op;
        this.updateDisplay();
    }
    
    executeFunction(func) {
        const value = parseFloat(this.currentValue);
        let result;
        
        try {
            switch(func) {
                case 'sin':
                    result = this.angleMode === 'deg' 
                        ? Math.sin(value * Math.PI / 180) 
                        : Math.sin(value);
                    break;
                case 'cos':
                    result = this.angleMode === 'deg'
                        ? Math.cos(value * Math.PI / 180)
                        : Math.cos(value);
                    break;
                case 'tan':
                    result = this.angleMode === 'deg'
                        ? Math.tan(value * Math.PI / 180)
                        : Math.tan(value);
                    break;
                case 'log':
                    if (value <= 0) throw new Error('لگاریتم اعداد منفی تعریف نشده');
                    result = Math.log10(value);
                    break;
                case 'ln':
                    if (value <= 0) throw new Error('لگاریتم طبیعی اعداد منفی تعریف نشده');
                    result = Math.log(value);
                    break;
                case 'sqrt':
                    if (value < 0) throw new Error('جذر اعداد منفی تعریف نشده');
                    result = Math.sqrt(value);
                    break;
                case 'pow':
                    result = Math.pow(value, 2);
                    break;
                case 'exp':
                    result = Math.exp(value);
                    break;
                case 'abs':
                    result = Math.abs(value);
                    break;
                case 'factorial':
                    if (value < 0 || !Number.isInteger(value)) {
                        throw new Error('فاکتوریل فقط برای اعداد صحیح مثبت تعریف شده');
                    }
                    result = this.factorial(value);
                    break;
                case 'pi':
                    result = Math.PI;
                    break;
                case 'e':
                    result = Math.E;
                    break;
                default:
                    return;
            }
            
            const expression = `${func}(${value})`;
            this.addToHistory(expression, result);
            this.currentValue = String(this.formatResult(result));
            this.waitingForOperand = true;
            this.updateDisplay();
            
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    executeAction(action) {
        switch(action) {
            case 'clear':
                this.clear();
                break;
            case 'delete':
                this.delete();
                break;
            case 'equals':
                this.equals();
                break;
            case 'negate':
                this.negate();
                break;
            case 'MC':
                this.memoryClear();
                break;
            case 'MR':
                this.memoryRecall();
                break;
            case 'M+':
                this.memoryAdd();
                break;
            case 'M-':
                this.memorySubtract();
                break;
            case 'MS':
                this.memoryStore();
                break;
        }
    }
    
    // =====================================
    // Calculation Methods
    // =====================================
    
    calculate(prev, current, operation) {
        try {
            let result;
            switch(operation) {
                case '+':
                    result = prev + current;
                    break;
                case '-':
                    result = prev - current;
                    break;
                case '*':
                    result = prev * current;
                    break;
                case '/':
                    if (current === 0) throw new Error('تقسیم بر صفر');
                    result = prev / current;
                    break;
                case '^':
                    result = Math.pow(prev, current);
                    break;
                default:
                    return current;
            }
            return result;
        } catch (error) {
            this.showError(error.message);
            return 'Error';
        }
    }
    
    equals() {
        if (!this.operation || this.waitingForOperand) return;
        
        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);
        const result = this.calculate(prev, current, this.operation);
        
        if (result === 'Error') return;
        
        const expression = `${prev} ${this.getOperatorSymbol(this.operation)} ${current}`;
        this.addToHistory(expression, result);
        
        this.currentValue = String(this.formatResult(result));
        this.previousValue = '';
        this.operation = null;
        this.waitingForOperand = true;
        this.updateDisplay();
    }
    
    factorial(n) {
        if (n === 0 || n === 1) return 1;
        if (n > 170) throw new Error('عدد بیش از حد بزرگ');
        return n * this.factorial(n - 1);
    }
    
    // =====================================
    // Memory Functions
    // =====================================
    
    memoryClear() {
        this.memory = 0;
        this.updateMemoryIndicator();
        this.showToast('حافظه پاک شد', 'success');
    }
    
    memoryRecall() {
        this.currentValue = String(this.memory);
        this.waitingForOperand = true;
        this.updateDisplay();
    }
    
    memoryAdd() {
        this.memory += parseFloat(this.currentValue);
        this.updateMemoryIndicator();
        this.showToast(`${this.memory} به حافظه اضافه شد`, 'success');
    }
    
    memorySubtract() {
        this.memory -= parseFloat(this.currentValue);
        this.updateMemoryIndicator();
        this.showToast(`${this.memory} از حافظه کم شد`, 'success');
    }
    
    memoryStore() {
        this.memory = parseFloat(this.currentValue);
        this.updateMemoryIndicator();
        this.showToast(`${this.memory} در حافظه ذخیره شد`, 'success');
    }
    
    updateMemoryIndicator() {
        if (this.memory !== 0) {
            this.memoryIndicator.classList.add('active');
        } else {
            this.memoryIndicator.classList.remove('active');
        }
    }
    
    // =====================================
    // Display & UI Methods
    // =====================================
    
    updateDisplay() {
        this.displayPrimary.textContent = this.currentValue;
        
        if (this.operation && this.previousValue !== '') {
            this.displaySecondary.textContent = 
                `${this.previousValue} ${this.getOperatorSymbol(this.operation)}`;
        } else {
            this.displaySecondary.textContent = '';
        }
    }
    
    clear() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.waitingForOperand = false;
        this.updateDisplay();
    }
    
    delete() {
        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }
        this.updateDisplay();
    }
    
    negate() {
        this.currentValue = String(parseFloat(this.currentValue) * -1);
        this.updateDisplay();
    }
    
    formatResult(num) {
        if (!isFinite(num)) return 'Error';
        
        // Round to avoid floating point errors
        const rounded = Math.round(num * 1e10) / 1e10;
        
        // Scientific notation for very large/small numbers
        if (Math.abs(rounded) > 1e10 || (Math.abs(rounded) < 1e-10 && rounded !== 0)) {
            return num.toExponential(6);
        }
        
        return rounded;
    }
    
    getOperatorSymbol(op) {
        const symbols = {
            '+': '+',
            '-': '−',
            '*': '×',
            '/': '÷',
            '^': '^'
        };
        return symbols[op] || op;
    }
    
    // =====================================
    // History Management
    // =====================================
    
    addToHistory(expression, result) {
        const historyItem = {
            expression,
            result: this.formatResult(result),
            timestamp: new Date().toLocaleString('fa-IR')
        };
        
        this.history.unshift(historyItem);
        if (this.history.length > 50) this.history.pop();
        
        this.saveHistory();
        this.renderHistory();
    }
    
    renderHistory() {
        const historyList = document.getElementById('historyList');
        
        if (this.history.length === 0) {
            historyList.innerHTML = '<p class="empty-history">تاریخچه‌ای وجود ندارد</p>';
            return;
        }
        
        historyList.innerHTML = this.history.map((item, index) => `
            <div class="history-item" data-index="${index}">
                <div class="expression">${item.expression}</div>
                <div class="result">= ${item.result}</div>
            </div>
        `).join('');
        
        // Add click listeners
        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = item.dataset.index;
                this.currentValue = String(this.history[index].result);
                this.updateDisplay();
            });
        });
    }
    
    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.renderHistory();
        this.showToast('تاریخچه پاک شد', 'success');
    }
    
    saveHistory() {
        localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
    }
    
    loadHistory() {
        const saved = localStorage.getItem('calculatorHistory');
        if (saved) {
            this.history = JSON.parse(saved);
            this.renderHistory();
        }
    }
    
    // =====================================
    // Keyboard Support
    // =====================================
    
    handleKeyboard(e) {
        e.preventDefault();
        
        // Numbers
        if (e.key >= '0' && e.key <= '9') {
            this.inputNumber(e.key);
        }
        
        // Operators
        else if (['+', '-', '*', '/'].includes(e.key)) {
            this.inputOperator(e.key);
        }
        
        // Special keys
        else if (e.key === 'Enter' || e.key === '=') {
            this.equals();
        }
        else if (e.key === 'Escape') {
            this.clear();
        }
        else if (e.key === 'Backspace') {
            this.delete();
        }
        else if (e.key === '.') {
            this.inputNumber('.');
        }
    }
    
    // =====================================
    // Utility Methods
    // =====================================
    
    showError(message) {
        this.showToast(message, 'error');
        this.clear();
    }
    
    showToast(message, type = 'error') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.style.background = type === 'error' ? '#ef4444' : '#10b981';
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// =====================================
// Theme Manager
// =====================================

class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }
    
    init() {
        this.applyTheme();
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });
    }
    
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
    }
    
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('theme', this.theme);
        
        const toggle = document.getElementById('themeToggle');
        toggle.textContent = this.theme === 'light' ? '🌙' : '☀️';
    }
}

// =====================================
// UI Controller
// =====================================

class UIController {
    constructor() {
        this.init();
    }
    
    init() {
        // History panel toggle
        const historyToggle = document.getElementById('historyToggle');
        const historyPanel = document.getElementById('historyPanel');
        
        historyToggle.addEventListener('click', () => {
            historyPanel.classList.toggle('hidden');
        });
        
        // Clear history button
        document.getElementById('clearHistory').addEventListener('click', () => {
            calculator.clearHistory();
        });
        
        // Shortcuts panel
        const shortcutsToggle = document.getElementById('shortcutsToggle');
        const shortcutsPanel = document.getElementById('shortcutsPanel');
        
        shortcutsToggle.addEventListener('click', () => {
            shortcutsPanel.classList.toggle('show');
        });
        
        // Close shortcuts when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.shortcuts-help')) {
                shortcutsPanel.classList.remove('show');
            }
        });
    }
}

// =====================================
// Initialize Application
// =====================================

let calculator;

document.addEventListener('DOMContentLoaded', () => {
    calculator = new ScientificCalculator();
    new ThemeManager();
    new UIController();
    
    console.log('🧮 ماشین‌حساب علمی آماده است!');
});
