import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Terms() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">Termini e Condizioni di Servizio</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-sm text-muted-foreground italic">Ultimo aggiornamento: 3 Gennaio 2026</p>

                    <section className="mt-8">
                        <h2 className="text-xl font-semibold">1. Descrizione del Servizio</h2>
                        <p>
                            VHS to Digital (il "Servizio") offre la conversione di supporti analogici (VHS, VHS-C, Hi8, ecc.) in formato digitale.
                            Il cliente spedisce i propri supporti presso il nostro laboratorio, dove vengono digitalizzati e resi disponibili per il download o spediti su supporto fisico.
                        </p>
                    </section>

                    <section className="mt-6">
                        <h2 className="text-xl font-semibold">2. Responsabilità sui Supporti</h2>
                        <p>
                            Sebbene trattiamo ogni nastro con la massima cura, il cliente riconosce che i materiali analogici sono per loro natura fragili e soggetti a degrado.
                            Non possiamo essere ritenuti responsabili per danni accidentali dovuti allo stato dei nastri forniti (es. rottura del nastro, muffa, smagnetizzazione).
                        </p>
                    </section>

                    <section className="mt-6">
                        <h2 className="text-xl font-semibold">3. Spedizione</h2>
                        <p>
                            Il cliente è responsabile del corretto imballaggio dei supporti. Le spese di spedizione verso il laboratorio sono a carico del cliente,
                            mentre la spedizione di ritorno è gestita secondo le tariffe selezionate al momento del checkout.
                        </p>
                    </section>

                    <section className="mt-6">
                        <h2 className="text-xl font-semibold">4. Pagamenti e Rimborsi</h2>
                        <p>
                            I pagamenti vengono elaborati in modo sicuro tramite Stripe. Una volta avviato il processo di digitalizzazione, non è possibile richiedere il rimborso
                            per il lavoro già eseguito. In caso di nastri vuoti, verrà rimborsata la quota relativa alla digitalizzazione, trattenendo i costi di gestione e spedizione.
                        </p>
                    </section>

                    <section className="mt-6">
                        <h2 className="text-xl font-semibold">5. Contenuti Vietati</h2>
                        <p>
                            Non accettiamo materiale che violi le leggi vigenti, inclusi contenuti pedopornografici o materiale protetto da copyright senza autorizzazione.
                            Ci riserviamo il diritto di rifiutare il servizio per contenuti ritenuti inappropriati.
                        </p>
                    </section>
                </CardContent>
            </Card>
        </div>
    );
}
