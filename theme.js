
'use strict';

(function () {
    const STORAGE_KEY = 'lazyloop-theme';
    const root = document.documentElement;

    function savedTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY) === 'light'
                ? 'light'
                : 'dark';
        } catch (_) {
            return 'dark';
        }
    }

    function applyTheme(theme) {
        root.dataset.theme = theme;
        const button = document.getElementById('themeToggle');
        if (!button) return;
        const next = theme === 'light' ? 'dark' : 'light';
        button.textContent = next === 'light' ? 'Light' : 'Dark';
        button.setAttribute('aria-label', `Switch to ${next} mode`);
        button.setAttribute('title', `Switch to ${next} mode`);
    }

    applyTheme(savedTheme());

    function setupSignedInputs() {
        const signedInputs = document.querySelectorAll('input[data-signed]');

        signedInputs.forEach(function (input) {
            let wrapper = input.closest('.value-input');

            if (!wrapper) {
                wrapper = document.createElement('div');
                wrapper.className = 'value-input';
                input.parentNode.insertBefore(wrapper, input);
                wrapper.appendChild(input);
            }

            let signButton = wrapper.querySelector(
                `.sign-toggle[data-target="${input.id}"]`
            );

            if (!signButton) {
                signButton = document.createElement('button');
                signButton.className = 'sign-toggle';
                signButton.type = 'button';
                signButton.dataset.target = input.id;
                signButton.textContent = '±';
                signButton.setAttribute(
                    'aria-label',
                    `Change sign of ${input.id}`
                );
                wrapper.insertBefore(signButton, input);
            }

            signButton.addEventListener('click', function () {
                const original = input.value.trim();

                if (original === '') return;

                // Accept both decimal separators.
                const normalized = original.replace(',', '.');
                const value = Number(normalized);

                if (!Number.isFinite(value)) return;

                // Preserve the user's decimal separator.
                if (value === 0) {
                    input.value = '0';
                } else if (original.startsWith('-')) {
                    input.value = original.slice(1);
                } else {
                    input.value = '-' + original;
                }

                // Trigger the calculator to update.
                input.dispatchEvent(
                    new Event('input', { bubbles: true })
                );
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        let button = document.getElementById('themeToggle');
        if (!button) {
            button = document.createElement('button');
            button.id = 'themeToggle';
            button.className = 'theme-toggle';
            button.type = 'button';
            document.body.appendChild(button);
        }
        applyTheme(root.dataset.theme || 'dark');
        button.addEventListener('click', function () {
            const next = root.dataset.theme === 'light' ? 'dark' : 'light';
            try { localStorage.setItem(STORAGE_KEY, next); } catch (_) {}
            applyTheme(next);
        });

        setupSignedInputs();
    });
}());
