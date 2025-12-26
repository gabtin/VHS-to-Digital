import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  HelpCircle,
  Video,
  Disc,
  Minus,
  Plus,
  Download,
  HardDrive,
  Cloud,
  Package,
  Recycle,
  Clock,
  Zap,
  CheckCircle2,
  Edit2
} from "lucide-react";
import { PRICING, type TapeFormat, type OutputFormat, type TapeHandling, type ProcessingSpeed, type PricingConfig, type ProductAvailability } from "@shared/schema";
import { t } from "@/lib/translations";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

const STEPS = t.wizard.steps;

const tapeFormatOptions: { id: TapeFormat; name: string; description: string; era: string; icon: typeof Video }[] = [
  { id: "vhs", ...t.formats.vhs, icon: Video },
  { id: "vhsc", ...t.formats.vhsc, icon: Video },
  { id: "hi8", ...t.formats.hi8, icon: Disc },
  { id: "minidv", ...t.formats.minidv, icon: Disc },
  { id: "betamax", ...t.formats.betamax, icon: Video },
];

const outputOptions: { id: OutputFormat; name: string; description: string; price: string; icon: typeof Download; included?: boolean }[] = [
  { id: "mp4", ...t.outputs.mp4, icon: Download, included: true },
  { id: "usb", ...t.outputs.usb, icon: HardDrive },
  { id: "dvd", ...t.outputs.dvd, icon: Disc },
  { id: "cloud", ...t.outputs.cloud, icon: Cloud },
];

const durationOptions = t.wizard.step3.durationOptions;

export default function GetStarted() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedFormats, setSelectedFormats] = useState<TapeFormat[]>([]);
  const [quantities, setQuantities] = useState<Record<TapeFormat, number>>({
    vhs: 0, vhsc: 0, hi8: 0, minidv: 0, betamax: 0
  });
  const [estimatedHours, setEstimatedHours] = useState(7);
  const [outputFormats, setOutputFormats] = useState<OutputFormat[]>(["mp4"]);
  const [dvdQuantity, setDvdQuantity] = useState(1);
  const [tapeHandling, setTapeHandling] = useState<TapeHandling>("dispose");
  const [processingSpeed, setProcessingSpeed] = useState<ProcessingSpeed>("standard");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isGift, setIsGift] = useState(false);

  const totalTapes = useMemo(() => {
    return selectedFormats.reduce((sum, format) => sum + (quantities[format] || 0), 0);
  }, [selectedFormats, quantities]);

  const { data: pricingConfigs, isLoading: pricingLoading } = useQuery<PricingConfig[]>({
    queryKey: ["/api/pricing"],
  });

  const { data: availability, isLoading: availabilityLoading } = useQuery<ProductAvailability[]>({
    queryKey: ["/api/availability"], // Assuming this is public too or needed
  });

  const dynamicPricing = useMemo(() => {
    const p: Record<string, number> = {};
    pricingConfigs?.forEach(c => {
      p[c.key] = parseFloat(c.value);
    });

    // Fallback to constants if loading or missing
    const getVal = (key: string, fallback: number) => p[key] ?? fallback;

    const basePrice = totalTapes * getVal("basePricePerTape", PRICING.basePricePerTape);
    const hourlyPrice = estimatedHours * getVal("pricePerHour", PRICING.pricePerHour);
    const usbPrice = outputFormats.includes("usb") ? getVal("usbDrive", PRICING.usbDrive) : 0;
    const dvdPrice = outputFormats.includes("dvd") ? dvdQuantity * getVal("dvdPerDisc", PRICING.dvdPerDisc) : 0;
    const cloudPrice = outputFormats.includes("cloud") ? getVal("cloudStorage", PRICING.cloudStorage) : 0;
    const returnPrice = tapeHandling === "return" ? getVal("returnShipping", PRICING.returnShipping) : 0;

    const subtotal = basePrice + hourlyPrice + usbPrice + dvdPrice + cloudPrice + returnPrice;
    const rushMultiplier = getVal("rushMultiplier", PRICING.rushMultiplier);
    const rushFee = processingSpeed === "rush" ? subtotal * rushMultiplier : 0;
    const total = subtotal + rushFee;

    return { basePrice, hourlyPrice, usbPrice, dvdPrice, cloudPrice, returnPrice, subtotal, rushFee, total };
  }, [totalTapes, estimatedHours, outputFormats, dvdQuantity, tapeHandling, processingSpeed, pricingConfigs]);

  const filteredTapeFormatOptions = useMemo(() => {
    if (!availability) return tapeFormatOptions;
    return tapeFormatOptions.filter(opt => {
      const avail = availability.find(a => a.name === opt.id && a.type === "tape_format");
      return avail ? avail.isActive : true;
    });
  }, [availability]);

  const filteredOutputOptions = useMemo(() => {
    if (!availability) return outputOptions;
    return outputOptions.filter(opt => {
      const avail = availability.find(a => a.name === opt.id && a.type === "output_format");
      return avail ? avail.isActive : true;
    });
  }, [availability]);

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 0: return selectedFormats.length > 0;
      case 1: return totalTapes > 0;
      case 2: return estimatedHours > 0;
      case 3: return outputFormats.length > 0;
      case 4: return tapeHandling !== undefined;
      case 5: return processingSpeed !== undefined;
      default: return true;
    }
  }, [currentStep, selectedFormats, totalTapes, estimatedHours, outputFormats, tapeHandling, processingSpeed]);

  const handleFormatToggle = (format: TapeFormat) => {
    setSelectedFormats(prev => {
      if (prev.includes(format)) {
        setQuantities(q => ({ ...q, [format]: 0 }));
        return prev.filter(f => f !== format);
      }
      setQuantities(q => ({ ...q, [format]: 1 }));
      return [...prev, format];
    });
  };

  const handleQuantityChange = (format: TapeFormat, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [format]: Math.max(0, Math.min(100, (prev[format] || 0) + delta))
    }));
  };

  const handleOutputToggle = (format: OutputFormat) => {
    if (format === "mp4") return;
    setOutputFormats(prev =>
      prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]
    );
  };

  const handleCheckout = () => {
    const config = {
      tapeFormats: quantities,
      totalTapes,
      estimatedHours,
      outputFormats,
      dvdQuantity: outputFormats.includes("dvd") ? dvdQuantity : undefined,
      tapeHandling,
      processingSpeed,
      specialInstructions: specialInstructions || undefined,
      isGift,
    };
    setLocation(`/checkout?config=${encodeURIComponent(JSON.stringify(config))}`);
  };

  if (pricingLoading || availabilityLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h1 className="text-lg font-semibold text-foreground" data-testid="text-wizard-title">
              {t.wizard.title}
            </h1>
            <Badge variant="secondary" data-testid="badge-step-indicator">
              {t.wizard.step} {currentStep + 1} {t.wizard.of} {STEPS.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" data-testid="progress-wizard" />
          <div className="flex justify-between mt-2">
            {STEPS.map((step, i) => (
              <span
                key={step}
                className={`text-xs ${i <= currentStep ? "text-accent font-medium" : "text-muted-foreground"}`}
              >
                {step}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-step-1-title">
                    {t.wizard.step1.title}
                  </h2>
                  <p className="text-muted-foreground">
                    {t.wizard.step1.subtitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredTapeFormatOptions.map((format) => (
                    <Card
                      key={format.id}
                      className={`cursor-pointer transition-all ${selectedFormats.includes(format.id)
                        ? "ring-2 ring-accent border-accent"
                        : "hover-elevate"
                        }`}
                      onClick={() => handleFormatToggle(format.id)}
                      data-testid={`card-format-${format.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selectedFormats.includes(format.id) ? "bg-accent" : "bg-secondary"
                            }`}>
                            <format.icon className={`w-6 h-6 ${selectedFormats.includes(format.id) ? "text-accent-foreground" : "text-muted-foreground"
                              }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground">{format.name}</h3>
                              {selectedFormats.includes(format.id) && (
                                <Check className="w-4 h-4 text-accent" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{format.era}</p>
                            <p className="text-sm text-muted-foreground mt-1">{format.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" data-testid="button-format-help">
                      <HelpCircle className="w-4 h-4 mr-2" />
                      {t.wizard.step1.helpButton}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t.wizard.step1.helpTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {filteredTapeFormatOptions.map((format) => (
                        <div key={format.id} className="flex gap-4 p-3 rounded-lg bg-secondary/50">
                          <format.icon className="w-8 h-8 text-muted-foreground flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-foreground">{format.name}</h4>
                            <p className="text-sm text-muted-foreground">{format.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{t.common.era}: {format.era}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-step-2-title">
                    {t.wizard.step2.title}
                  </h2>
                  <p className="text-muted-foreground">
                    {t.wizard.step2.subtitle}
                  </p>
                </div>

                <div className="space-y-4">
                  {selectedFormats.map((format) => {
                    const formatInfo = tapeFormatOptions.find(f => f.id === format)!;
                    return (
                      <Card key={format} data-testid={`card-quantity-${format}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <formatInfo.icon className="w-6 h-6 text-muted-foreground" />
                              <div>
                                <h3 className="font-medium text-foreground">{formatInfo.name}</h3>
                                <p className="text-xs text-muted-foreground">{formatInfo.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleQuantityChange(format, -1)}
                                disabled={quantities[format] <= 0}
                                data-testid={`button-decrease-${format}`}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-12 text-center font-semibold text-lg text-foreground">
                                {quantities[format]}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleQuantityChange(format, 1)}
                                disabled={quantities[format] >= 100}
                                data-testid={`button-increase-${format}`}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t.wizard.step2.totalTapes}</span>
                    <span className="text-xl font-bold text-foreground">{totalTapes}</span>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-step-3-title">
                    {t.wizard.step3.title}
                  </h2>
                  <p className="text-muted-foreground">
                    {t.wizard.step3.subtitle}
                  </p>
                </div>

                <Card className="bg-accent/10 border-accent/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-accent mt-0.5" />
                      <div>
                        <h4 className="font-medium text-foreground mb-1">{t.wizard.step3.helpTitle}</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {t.wizard.step3.helpItems.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {durationOptions.map((option) => (
                    <Card
                      key={option.value}
                      className={`cursor-pointer transition-all ${estimatedHours === option.value
                        ? "ring-2 ring-accent border-accent"
                        : "hover-elevate"
                        }`}
                      onClick={() => setEstimatedHours(option.value)}
                      data-testid={`card-duration-${option.value}`}
                    >
                      <CardContent className="p-4 text-center">
                        <span className={`font-medium ${estimatedHours === option.value ? "text-accent" : "text-foreground"
                          }`}>
                          {option.label}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-step-4-title">
                    {t.wizard.step4.title}
                  </h2>
                  <p className="text-muted-foreground">
                    {t.wizard.step4.subtitle}
                  </p>
                </div>

                <div className="space-y-3">
                  {filteredOutputOptions.map((option) => (
                    <Card
                      key={option.id}
                      className={`cursor-pointer transition-all ${outputFormats.includes(option.id)
                        ? "ring-2 ring-accent border-accent"
                        : option.included ? "opacity-100" : "hover-elevate"
                        }`}
                      onClick={() => handleOutputToggle(option.id)}
                      data-testid={`card-output-${option.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${outputFormats.includes(option.id) ? "bg-accent" : "bg-secondary"
                            }`}>
                            <option.icon className={`w-6 h-6 ${outputFormats.includes(option.id) ? "text-accent-foreground" : "text-muted-foreground"
                              }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground">{option.name}</h3>
                              {option.included && (
                                <Badge variant="secondary" className="text-xs">{t.common.required}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{option.description}</p>
                          </div>
                          <div className="text-right">
                            <span className={`font-medium ${option.included ? "text-accent" : "text-foreground"}`}>
                              {option.price}
                            </span>
                            {outputFormats.includes(option.id) && !option.included && (
                              <Check className="w-4 h-4 text-accent ml-auto mt-1" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {outputFormats.includes("dvd") && (
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <Label className="text-foreground mb-2 block">{t.wizard.step4.dvdLabel}</Label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDvdQuantity(Math.max(1, dvdQuantity - 1))}
                        data-testid="button-dvd-decrease"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-semibold text-lg text-foreground">{dvdQuantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDvdQuantity(Math.min(20, dvdQuantity + 1))}
                        data-testid="button-dvd-increase"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-step-5-title">
                    {t.wizard.step5.title}
                  </h2>
                  <p className="text-muted-foreground">
                    {t.wizard.step5.subtitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card
                    className={`cursor-pointer transition-all ${tapeHandling === "return"
                      ? "ring-2 ring-accent border-accent"
                      : "hover-elevate"
                      }`}
                    onClick={() => setTapeHandling("return")}
                    data-testid="card-handling-return"
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${tapeHandling === "return" ? "bg-accent" : "bg-secondary"
                        }`}>
                        <Package className={`w-8 h-8 ${tapeHandling === "return" ? "text-accent-foreground" : "text-muted-foreground"
                          }`} />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{t.wizard.step5.returnTitle}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {t.wizard.step5.returnDescription}
                      </p>
                      <span className="font-medium text-foreground">{t.wizard.step5.returnPrice}</span>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all ${tapeHandling === "dispose"
                      ? "ring-2 ring-accent border-accent"
                      : "hover-elevate"
                      }`}
                    onClick={() => setTapeHandling("dispose")}
                    data-testid="card-handling-dispose"
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${tapeHandling === "dispose" ? "bg-accent" : "bg-secondary"
                        }`}>
                        <Recycle className={`w-8 h-8 ${tapeHandling === "dispose" ? "text-accent-foreground" : "text-muted-foreground"
                          }`} />
                      </div>
                      <Badge variant="secondary" className="mb-2">{t.wizard.step5.disposeBadge}</Badge>
                      <h3 className="font-semibold text-foreground mb-2">{t.wizard.step5.disposeTitle}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {t.wizard.step5.disposeDescription}
                      </p>
                      <span className="font-medium text-accent">{t.wizard.step5.disposePrice}</span>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-step-6-title">
                    {t.wizard.step6.title}
                  </h2>
                  <p className="text-muted-foreground">
                    {t.wizard.step6.subtitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card
                    className={`cursor-pointer transition-all ${processingSpeed === "standard"
                      ? "ring-2 ring-accent border-accent"
                      : "hover-elevate"
                      }`}
                    onClick={() => setProcessingSpeed("standard")}
                    data-testid="card-speed-standard"
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${processingSpeed === "standard" ? "bg-accent" : "bg-secondary"
                        }`}>
                        <Clock className={`w-8 h-8 ${processingSpeed === "standard" ? "text-accent-foreground" : "text-muted-foreground"
                          }`} />
                      </div>
                      <Badge variant="secondary" className="mb-2">{t.wizard.step6.standardBadge}</Badge>
                      <h3 className="font-semibold text-foreground mb-2">{t.wizard.step6.standardTitle}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{t.wizard.step6.standardDescription}</p>
                      <span className="font-medium text-accent">{t.common.included}</span>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all ${processingSpeed === "rush"
                      ? "ring-2 ring-accent border-accent"
                      : "hover-elevate"
                      }`}
                    onClick={() => setProcessingSpeed("rush")}
                    data-testid="card-speed-rush"
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${processingSpeed === "rush" ? "bg-accent" : "bg-secondary"
                        }`}>
                        <Zap className={`w-8 h-8 ${processingSpeed === "rush" ? "text-accent-foreground" : "text-muted-foreground"
                          }`} />
                      </div>
                      <Badge className="bg-accent/20 text-accent mb-2">Priorita</Badge>
                      <h3 className="font-semibold text-foreground mb-2">{t.wizard.step6.rushTitle}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{t.wizard.step6.rushDescription}</p>
                      <span className="font-medium text-foreground">{t.wizard.step6.rushPrice}</span>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-step-7-title">
                    {t.wizard.step7.title}
                  </h2>
                  <p className="text-muted-foreground">
                    {t.wizard.step7.subtitle}
                  </p>
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-foreground">{t.wizard.sections.tapes}</h3>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentStep(0)} data-testid="button-edit-tapes">
                          <Edit2 className="w-3 h-3 mr-1" /> {t.wizard.step7.editButton}
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {selectedFormats.map((format) => {
                          const info = tapeFormatOptions.find(f => f.id === format)!;
                          return (
                            <div key={format} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{info.name}</span>
                              <span className="text-foreground">{quantities[format]} {t.common.tapes}</span>
                            </div>
                          );
                        })}
                        <div className="flex justify-between text-sm font-medium pt-2 border-t">
                          <span className="text-foreground">{t.wizard.step2.totalTapes}</span>
                          <span className="text-foreground">{totalTapes}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-foreground">{t.wizard.sections.output}</h3>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentStep(3)} data-testid="button-edit-output">
                          <Edit2 className="w-3 h-3 mr-1" /> {t.wizard.step7.editButton}
                        </Button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t.wizard.sections.duration}</span>
                          <span className="text-foreground">{estimatedHours} {t.common.hours}</span>
                        </div>
                        {outputFormats.map((format) => {
                          const info = outputOptions.find(f => f.id === format)!;
                          return (
                            <div key={format} className="flex justify-between">
                              <span className="text-muted-foreground">{info.name}</span>
                              <span className="text-foreground">{info.price}</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-foreground">{t.wizard.sections.processing}</h3>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentStep(5)} data-testid="button-edit-processing">
                          <Edit2 className="w-3 h-3 mr-1" /> {t.wizard.step7.editButton}
                        </Button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Velocita</span>
                          <span className="text-foreground">
                            {processingSpeed === "rush" ? t.wizard.step6.rushTitle : t.wizard.step6.standardTitle}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t.wizard.sections.handling}</span>
                          <span className="text-foreground">
                            {tapeHandling === "return" ? t.wizard.step5.returnTitle : t.wizard.step5.disposeTitle}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <Label htmlFor="instructions" className="font-semibold text-foreground mb-2 block">
                        {t.wizard.step7.specialInstructions}
                      </Label>
                      <Textarea
                        id="instructions"
                        placeholder={t.wizard.step7.specialPlaceholder}
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        className="resize-none"
                        rows={3}
                        data-testid="textarea-instructions"
                      />
                      <div className="flex items-center gap-2 mt-4">
                        <Checkbox
                          id="gift"
                          checked={isGift}
                          onCheckedChange={(checked) => setIsGift(!!checked)}
                          data-testid="checkbox-gift"
                        />
                        <Label htmlFor="gift" className="text-sm text-muted-foreground">
                          {t.wizard.step7.giftLabel} - {t.wizard.step7.giftDescription}
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.wizard.summary.backButton}
              </Button>

              {currentStep < STEPS.length - 1 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canProceed}
                  className="bg-accent text-accent-foreground"
                  data-testid="button-next"
                >
                  {t.wizard.summary.continueButton}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleCheckout}
                  className="bg-accent text-accent-foreground"
                  data-testid="button-checkout"
                >
                  {t.wizard.summary.checkoutButton}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">{t.wizard.summary.title}</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.wizard.summary.baseCost} ({totalTapes} {t.wizard.summary.tapes})</span>
                    <span className="text-foreground">{dynamicPricing.basePrice.toFixed(2)} EUR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.wizard.summary.footage} ({estimatedHours} {t.wizard.summary.hours})</span>
                    <span className="text-foreground">{dynamicPricing.hourlyPrice.toFixed(2)} EUR</span>
                  </div>
                  {dynamicPricing.usbPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.wizard.summary.usbDrive}</span>
                      <span className="text-foreground">{dynamicPricing.usbPrice.toFixed(2)} EUR</span>
                    </div>
                  )}
                  {dynamicPricing.dvdPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.wizard.summary.dvdCopies} ({dvdQuantity} {t.wizard.summary.discs})</span>
                      <span className="text-foreground">{dynamicPricing.dvdPrice.toFixed(2)} EUR</span>
                    </div>
                  )}
                  {dynamicPricing.cloudPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.wizard.summary.cloudStorage}</span>
                      <span className="text-foreground">{dynamicPricing.cloudPrice.toFixed(2)} EUR</span>
                    </div>
                  )}
                  {dynamicPricing.returnPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.wizard.summary.returnShipping}</span>
                      <span className="text-foreground">{dynamicPricing.returnPrice.toFixed(2)} EUR</span>
                    </div>
                  )}
                </div>

                <div className="border-t my-4" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.wizard.summary.subtotal}</span>
                    <span className="text-foreground">{dynamicPricing.subtotal.toFixed(2)} EUR</span>
                  </div>
                  {dynamicPricing.rushFee > 0 && (
                    <div className="flex justify-between text-amber-600">
                      <span>{t.wizard.summary.rushFee} (+50%)</span>
                      <span>{dynamicPricing.rushFee.toFixed(2)} EUR</span>
                    </div>
                  )}
                </div>

                <div className="border-t my-4" />

                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-foreground">{t.wizard.summary.estimatedTotal}</span>
                  <span className="text-accent">{dynamicPricing.total.toFixed(2)} EUR</span>
                </div>

                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Prezzo finale calcolato dopo l'ispezione delle cassette
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
