import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
    value: string; // YYYY-MM-DD format
    onChange: (value: string) => void;
    placeholder?: string;
    hasError?: boolean;
    disabled?: boolean;
    minDate?: string;
    style?: React.CSSProperties;
    className?: string;
}

const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const DAYS_EN = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const DAYS_AR = ['أح','اث','ث','أر','خم','ج','س'];

const DatePicker: React.FC<DatePickerProps> = ({
    value,
    onChange,
    placeholder,
    hasError,
    disabled,
    minDate,
    style,
    className,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
    const [viewDate, setViewDate] = useState<Date>(() => {
        if (value) return new Date(value + 'T00:00:00');
        return new Date();
    });
    const triggerRef = useRef<HTMLDivElement>(null);

    const isAr = document.documentElement.dir === 'rtl' || document.documentElement.lang === 'ar';
    const MONTHS = isAr ? MONTHS_AR : MONTHS_EN;
    const DAYS = isAr ? DAYS_AR : DAYS_EN;

    useEffect(() => {
        if (value) setViewDate(new Date(value + 'T00:00:00'));
    }, [value]);

    const updatePosition = useCallback(() => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const dropdownHeight = 340;
            const top = spaceBelow >= dropdownHeight
                ? rect.bottom + window.scrollY + 4
                : rect.top + window.scrollY - dropdownHeight - 4;
            setDropdownPos({
                top,
                left: rect.left + window.scrollX,
                width: Math.max(rect.width, 280),
            });
        }
    }, []);

    const openCalendar = () => {
        if (disabled) return;
        updatePosition();
        setIsOpen(true);
    };

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (triggerRef.current && !triggerRef.current.contains(target)) {
                const portal = document.getElementById('datepicker-portal');
                if (!portal || !portal.contains(target)) {
                    setIsOpen(false);
                }
            }
        };
        const handleScroll = () => updatePosition();
        const handleResize = () => updatePosition();
        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleResize);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleResize);
        };
    }, [isOpen, updatePosition]);

    const selectedDate = value ? new Date(value + 'T00:00:00') : null;
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const toYMD = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const selectDay = (day: number) => {
        const d = new Date(year, month, day);
        const formatted = toYMD(d);
        if (minDate && formatted < minDate) return;
        onChange(formatted);
        setIsOpen(false);
    };

    const formatDisplay = (val: string) => {
        if (!val) return '';
        const d = new Date(val + 'T00:00:00');
        return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    };

    const isSelected = (day: number) =>
        !!selectedDate && selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === day;

    const isToday = (day: number) => {
        const t = new Date();
        return t.getFullYear() === year && t.getMonth() === month && t.getDate() === day;
    };

    const isDisabledDay = (day: number) => {
        if (!minDate) return false;
        return toYMD(new Date(year, month, day)) < minDate;
    };

    const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    while (cells.length % 7 !== 0) cells.push(null);

    const dropdown = isOpen ? ReactDOM.createPortal(
        <div
            id="datepicker-portal"
            style={{
                position: 'absolute',
                top: dropdownPos.top,
                left: dropdownPos.left,
                width: 280,
                zIndex: 99999,
                background: 'white',
                borderRadius: '14px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
            }}
        >
            {/* Month header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px',
                background: 'linear-gradient(135deg, #c3924d 0%, #e0a958 100%)',
                color: 'white',
            }}>
                <button
                    onClick={prevMonth}
                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', padding: '5px', borderRadius: '8px', transition: 'background 0.2s' }}
                    onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.35)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
                >
                    <ChevronLeft size={16} />
                </button>
                <span style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '0.3px' }}>{MONTHS[month]} {year}</span>
                <button
                    onClick={nextMonth}
                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', padding: '5px', borderRadius: '8px', transition: 'background 0.2s' }}
                    onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.35)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Day labels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '10px 10px 4px', gap: '2px' }}>
                {DAYS.map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#94a3b8', padding: '4px 0', letterSpacing: '0.5px' }}>{d}</div>
                ))}
            </div>

            {/* Days */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 10px 8px', gap: '2px' }}>
                {cells.map((day, idx) => {
                    const sel = day ? isSelected(day) : false;
                    const tod = day ? isToday(day) : false;
                    const dis = day ? isDisabledDay(day) : false;
                    return (
                        <div
                            key={idx}
                            onClick={() => day && !dis && selectDay(day)}
                            style={{
                                textAlign: 'center',
                                padding: '7px 2px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: sel ? 700 : tod ? 600 : 400,
                                cursor: day && !dis ? 'pointer' : 'default',
                                background: sel
                                    ? 'linear-gradient(135deg, #c3924d, #e0a958)'
                                    : 'transparent',
                                color: sel ? 'white' : dis ? '#d1d5db' : tod ? '#c3924d' : day ? '#1e293b' : 'transparent',
                                border: tod && !sel ? '1.5px solid #e0a958' : '1.5px solid transparent',
                                transition: 'all 0.15s',
                                opacity: !day ? 0 : 1,
                                userSelect: 'none',
                            }}
                            onMouseOver={e => { if (day && !dis && !sel) e.currentTarget.style.background = '#fdf3e7'; }}
                            onMouseOut={e => { if (day && !dis && !sel) e.currentTarget.style.background = 'transparent'; }}
                        >
                            {day || ''}
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px 12px', borderTop: '1px solid #f1f5f9' }}>
                <button
                    onClick={() => { onChange(''); setIsOpen(false); }}
                    style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px', transition: 'all 0.15s' }}
                    onMouseOver={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
                    onMouseOut={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'none'; }}
                >
                    {isAr ? 'مسح' : 'Clear'}
                </button>
                <button
                    onClick={() => { const t = new Date(); setViewDate(t); selectDay(t.getDate()); }}
                    style={{ fontSize: '12px', fontWeight: 700, color: '#c3924d', background: '#fdf3e7', border: '1px solid #f0d9b5', cursor: 'pointer', padding: '4px 10px', borderRadius: '6px', transition: 'all 0.15s' }}
                    onMouseOver={e => { e.currentTarget.style.background = '#fdebd0'; }}
                    onMouseOut={e => { e.currentTarget.style.background = '#fdf3e7'; }}
                >
                    {isAr ? 'اليوم' : 'Today'}
                </button>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <>
            <div ref={triggerRef} style={{ position: 'relative', display: 'inline-block', width: '100%', ...style }} className={className}>
                <div
                    onClick={openCalendar}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: `1.5px solid ${hasError ? '#ef4444' : isOpen ? '#c3924d' : '#e2e8f0'}`,
                        background: disabled ? '#f8fafc' : 'white',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        color: value ? '#1e293b' : '#94a3b8',
                        boxShadow: isOpen ? '0 0 0 3px rgba(195,146,77,0.12)' : '0 1px 2px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s',
                        userSelect: 'none',
                        minHeight: '38px',
                    }}
                >
                    <Calendar size={15} color={isOpen ? '#c3924d' : '#94a3b8'} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: '13.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value ? formatDisplay(value) : (placeholder || 'Select date')}</span>
                    {value && !disabled && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onChange(''); setIsOpen(false); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', display: 'flex', color: '#cbd5e1', lineHeight: 1 }}
                            onMouseOver={e => (e.currentTarget.style.color = '#94a3b8')}
                            onMouseOut={e => (e.currentTarget.style.color = '#cbd5e1')}
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>
            </div>
            {dropdown}
        </>
    );
};

export default DatePicker;
