import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Privacy() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">Informativa sulla Privacy</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-sm text-muted-foreground italic">Ultimo aggiornamento: 3 Gennaio 2026</p>

                    <section className="mt-8">
                        <h2 className="text-xl font-semibold">1. Trattamento dei Dati Personali</h2>
                        <p>
                            Ai sensi del GDPR, raccogliamo solo i dati necessari per l'esecuzione del servizio: nome, indirizzo email, numero di telefono
                            e indirizzo di spedizione. Questi dati sono utilizzati esclusivamente per la gestione degli ordini e le comunicazioni relative.
                        </p>
                    </section>

                    <section className="mt-6">
                        <h2 className="text-xl font-semibold">2. Trattamento dei Contenuti Video</h2>
                        <p>
                            I tuoi ricordi sono privati. Il personale accede ai video esclusivamente per verificarne la qualità tecnica durante la digitalizzazione.
                            I file digitali vengono conservati sui nostri server sicuri per un periodo limitato (30 giorni dopo la consegna) per permetterti il download,
                            dopodiché vengono cancellati definitivamente.
                        </p>
                    </section>

                    <section className="mt-6">
                        <h2 className="text-xl font-semibold">3. Servizi di Terze Parti</h2>
                        <p>
                            Utilizziamo fornitori esterni affidabili per gestire specifiche funzionalità:
                            <ul className="list-disc pl-6 mt-2">
                                <li><strong>Stripe</strong>: Per l'elaborazione sicura dei pagamenti.</li>
                                <li><strong>Sendcloud</strong>: Per la gestione delle spedizioni e delle etichette.</li>
                                <li><strong>SendGrid</strong>: Per l'invio delle email transazionali.</li>
                            </ul>
                        </p>
                    </section>

                    <section className="mt-6">
                        <h2 className="text-xl font-semibold">4. I Tuoi Diritti</h2>
                        <p>
                            Hai il diritto di accedere ai tuoi dati, rettificarli o richiederne la cancellazione in qualsiasi momento tramite il tuo profilo utente
                            o contattando il nostro supporto.
                        </p>
                    </section>

                    <section className="mt-6">
                        <h2 className="text-xl font-semibold">5. Cookie</h2>
                        <p>
                            Utilizziamo solo cookie tecnici necessari al funzionamento del sito e alla gestione della sessione di login.
                        </p>
                    </section>
                </CardContent>
            </Card>
        </div>
    );
}
