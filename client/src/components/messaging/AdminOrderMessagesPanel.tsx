import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Send, MessageCircle, User, ShieldCheck, Mail } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
    id: string;
    message: string;
    isAdminMessage: boolean;
    createdAt: string;
    user: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string | null;
    };
}

interface AdminOrderMessagesPanelProps {
    orderId: string;
    orderNumber: string;
    customerName: string;
}

export function AdminOrderMessagesPanel({ orderId, orderNumber, customerName }: AdminOrderMessagesPanelProps) {
    const [newMessage, setNewMessage] = useState('');
    const queryClient = useQueryClient();
    const scrollRef = useRef<HTMLDivElement>(null);

    const { data, isLoading } = useQuery<{ messages: Message[] }>({
        queryKey: [`/api/orders/${orderId}/messages`],
    });

    const messages = data?.messages || [];

    const sendMessageMutation = useMutation({
        mutationFn: async (message: string) => {
            const res = await apiRequest('POST', `/api/orders/${orderId}/messages`, { message });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/orders/${orderId}/messages`] });
            setNewMessage('');
        },
    });

    const handleSend = () => {
        if (newMessage.trim()) {
            sendMessageMutation.mutate(newMessage);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <Card className="border-stone-200 shadow-sm overflow-hidden">
            <div className="bg-stone-900 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-accent" />
                    <h3 className="text-lg font-semibold text-white">Chat con Cliente</h3>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs text-stone-300 font-semibold tracking-tight">#{orderNumber}</span>
                    <span className="text-[10px] text-stone-400 font-medium">{customerName}</span>
                </div>
            </div>

            <CardContent className="p-0">
                <ScrollArea className="h-[400px] px-6 py-6" ref={scrollRef}>
                    {isLoading ? (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={`h-20 w-3/4 rounded-lg bg-stone-100 animate-pulse ${i % 2 !== 0 ? 'self-end' : ''}`} />
                            ))}
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-10">
                            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-4">
                                <MessageCircle className="w-6 h-6 text-stone-400" />
                            </div>
                            <p className="text-sm text-stone-600 font-medium max-w-[200px]">
                                Nessuna conversazione avviata con il cliente per questo ordine.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {[...messages].reverse().map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col gap-1 max-w-[85%] ${!msg.isAdminMessage ? 'self-start' : 'self-end items-end'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        {!msg.isAdminMessage ? (
                                            <div className="flex items-center gap-1">
                                                <User className="w-3 h-3 text-blue-700" />
                                                <span className="text-[10px] uppercase tracking-wider font-bold text-blue-700">{customerName}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1">
                                                <ShieldCheck className="w-3 h-3 text-stone-600" />
                                                <span className="text-[10px] uppercase tracking-wider font-bold text-stone-600">Tu (Admin)</span>
                                            </div>
                                        )}
                                        <span className="text-[10px] text-stone-600 font-medium">
                                            {format(new Date(msg.createdAt), 'HH:mm', { locale: it })}
                                        </span>
                                    </div>

                                    <div
                                        className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${!msg.isAdminMessage
                                            ? 'bg-blue-50 border border-blue-100 text-blue-900 rounded-tl-none'
                                            : 'bg-stone-800 text-white rounded-tr-none'
                                            }`}
                                    >
                                        {msg.message}
                                    </div>

                                    <span className="text-[9px] text-stone-600 mt-1 font-medium">
                                        {format(new Date(msg.createdAt), 'd MMM yyyy', { locale: it })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <div className="p-4 border-t border-stone-200 bg-stone-50/50">
                    <div className="flex flex-col gap-3">
                        <Textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Invia un messaggio al cliente..."
                            rows={3}
                            className="resize-none border-stone-300 focus-visible:ring-stone-400 bg-white text-stone-900 placeholder:text-stone-500"
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!newMessage.trim() || sendMessageMutation.isPending}
                            className="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-xl shadow-sm border-none h-11"
                        >
                            {sendMessageMutation.isPending ? (
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Invia al Cliente
                                </>
                            )}
                        </Button>
                        <div className="flex items-center justify-center gap-1.5 opacity-60">
                            <Mail className="w-3 h-3 text-stone-600" />
                            <p className="text-[10px] text-center text-stone-600 font-medium">
                                Il cliente riceverà anche una notifica via email (SendGrid).
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
