/**
 * AvatarCircle — Shows profile photo or coloured initials fallback.
 * Usage:
 *   <AvatarCircle user={currentUser} size={32} />
 *   <AvatarCircle user={currentUser} size={48} className="ring-2 ring-white" />
 */
import React from 'react';

// Deterministic colour from name string
const COLOURS = [
  ['#dbeafe','#1d4ed8'], // blue
  ['#dcfce7','#15803d'], // green
  ['#fef3c7','#b45309'], // amber
  ['#ede9fe','#6d28d9'], // violet
  ['#fee2e2','#b91c1c'], // red
  ['#cffafe','#0e7490'], // cyan
  ['#fce7f3','#9d174d'], // pink
  ['#d1fae5','#065f46'], // emerald
];

function colourFor(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffff;
  return COLOURS[h % COLOURS.length];
}

function initials(name = '', email = '') {
  const src = name || email;
  const parts = src.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

export default function AvatarCircle({ user, size = 32, className = '' }) {
  if (!user) return null;

  const style = {
    width:        size,
    height:       size,
    borderRadius: '50%',
    flexShrink:   0,
    display:      'inline-flex',
    alignItems:   'center',
    justifyContent: 'center',
    overflow:     'hidden',
  };

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name || user.email}
        style={{ ...style, objectFit: 'cover' }}
        className={className}
      />
    );
  }

  const [bg, fg] = colourFor(user.name || user.email || '');
  const fontSize = Math.round(size * 0.38);

  return (
    <div style={{ ...style, background: bg }} className={className}>
      <span style={{ color: fg, fontSize, fontWeight: 700, lineHeight: 1, fontFamily: 'system-ui,sans-serif', userSelect: 'none' }}>
        {initials(user.name, user.email)}
      </span>
    </div>
  );
}
