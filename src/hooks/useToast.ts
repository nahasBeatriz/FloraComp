"use client";

import { useCallback, useEffect, useState } from "react";

// Notificação discreta e temporária pra erros de ações que já se recuperam
// sozinhas (ex: reverter um favorito otimista) mas que o usuário merece saber
// que falharam.
export function useToast(duration = 3000) {
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => setMessage(null), duration);
        return () => clearTimeout(timer);
    }, [message, duration]);

    const showToast = useCallback((msg: string) => setMessage(msg), []);

    return { toastMessage: message, showToast };
}
