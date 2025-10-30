{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}


import { useEffect } from 'react';

function useCustomTooltips() {
  useEffect(() => {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);

    
    function showTooltip(e: Event) {
      const target = (e.target as HTMLElement).closest('[title]');
      if (!target) return;
      const title = target.getAttribute('title');
      if (!title) return;
      target.setAttribute('data-title', title);
      target.removeAttribute('title');
      tooltip.textContent = title;
      tooltip.classList.add('show');
      const rect = target.getBoundingClientRect();
      const tooltipWidth =  tooltip.offsetWidth || 180;
      const tooltipHeight = tooltip.offsetHeight || 32;
      let top = rect.bottom + window.scrollY + 8;
      let left = rect.left + window.scrollX;
      // If tooltip goes beyond right edge, flip to left
      if (left + tooltipWidth > window.innerWidth - 8) {
        left = rect.right + window.scrollX - tooltipWidth;
      }
      // If tooltip goes beyond left edge, clamp to 8px
      if (left < 8) {
        left = 8;
      }
      // If tooltip goes beyond bottom edge, show above
      if (top + tooltipHeight > window.innerHeight - 8) {
        top = rect.top + window.scrollY - tooltipHeight - 8;
      }
      // If tooltip goes above top edge, clamp to 8px
      if (top < 8) {
        top = 8;
      }
      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;
    }

    function hideTooltip(e: Event) {
      const target = (e.target as HTMLElement).closest('[data-title]');
      if (!target) return;
      tooltip.classList.remove('show');
      target.setAttribute('title', target.getAttribute('data-title') || '');
      target.removeAttribute('data-title');
    }

    document.addEventListener('mouseover', showTooltip);
    document.addEventListener('mouseout', hideTooltip);
    document.addEventListener('focusin', showTooltip);
    document.addEventListener('focusout', hideTooltip);

    return () => {
      document.body.removeChild(tooltip);
      document.removeEventListener('mouseover', showTooltip);
      document.removeEventListener('mouseout', hideTooltip);
      document.removeEventListener('focusin', showTooltip);
      document.removeEventListener('focusout', hideTooltip);
    };
  }, []);
}

export default useCustomTooltips;