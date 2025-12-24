import { useState, useMemo } from "react";
import { Link } from "wouter";
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
import { PRICING, type TapeFormat, type OutputFormat, type TapeHandling, type ProcessingSpeed } from "@shared/schema";

const STEPS = [
  "Format",
  "Quantity",
  "Duration",
  "Output",
  "Handling",
  "Speed",
  "Review",
];

const tapeFormatOptions: { id: TapeFormat; name: string; description: string; era: string; icon: typeof Video }[] = [
  { id: "vhs", name: "VHS", description: "Standard VHS tapes (T-120, T-160)", era: "1980s-2000s", icon: Video },
  { id: "vhsc", name: "VHS-C", description: "Compact VHS camcorder tapes", era: "1985-2000s", icon: Video },
  { id: "hi8", name: "Hi8 / Video8", description: "Sony camcorder formats", era: "1985-2000s", icon: Disc },
  { id: "minidv", name: "MiniDV", description: "Digital camcorder tapes", era: "1995-2010s", icon: Disc },
  { id: "betamax", name: "Betamax", description: "Legacy Sony format", era: "1975-1988", icon: Video },
];

const outputOptions: { id: OutputFormat; name: string; description: string; price: string; icon: typeof Download; included?: boolean }[] = [
  { id: "mp4", name: "Digital Download (MP4)", description: "High-quality H.264 encoding, 30-day download access", price: "Included", icon: Download, included: true },
  { id: "usb", name: "USB Flash Drive", description: "Pre-loaded and mailed to you", price: "+$15", icon: HardDrive },
  { id: "dvd", name: "DVD Copies", description: "Chaptered for easy navigation", price: "+$8/disc", icon: Disc },
  { id: "cloud", name: "Cloud Storage", description: "1 year secure access with shareable links", price: "+$10", icon: Cloud },
];

const durationOptions = [
  { label: "Less than 5 hours", value: 3 },
  { label: "5-10 hours", value: 7 },
  { label: "10-20 hours", value: 15 },
  { label: "20-50 hours", value: 35 },
  { label: "50+ hours", value: 60 },
];

export default function GetStarted() {
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

  const pricing = useMemo(() => {
    const basePrice = totalTapes * PRICING.basePricePerTape;
    const hourlyPrice = estimatedHours * PRICING.pricePerHour;
    const usbPrice = outputFormats.includes("usb") ? PRICING.usbDrive : 0;
    const dvdPrice = outputFormats.includes("dvd") ? dvdQuantity * PRICING.dvdPerDisc : 0;
    const cloudPrice = outputFormats.includes("cloud") ? PRICING.cloudStorage : 0;
    const returnPrice = tapeHandling === "return" ? PRICING.returnShipping : 0;
    
    const subtotal = basePrice + hourlyPrice + usbPrice + dvdPrice + cloudPrice + returnPrice;
    const rushFee = processingSpeed === "rush" ? subtotal * PRICING.rushMultiplier : 0;
    const total = subtotal + rushFee;

    return { basePrice, hourlyPrice, usbPrice, dvdPrice, cloudPrice, returnPrice, subtotal, rushFee, total };
  }, [totalTapes, estimatedHours, outputFormats, dvdQuantity, tapeHandling, processingSpeed]);

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

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h1 className="text-lg font-semibold text-foreground" data-testid="text-wizard-title">
              Configure Your Order
            </h1>
            <Badge variant="secondary" data-testid="badge-step-indicator">
              Step {currentStep + 1} of {STEPS.length}
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
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Format Selection */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-step-1-title">
                    What type of tapes do you have?
                  </h2>
                  <p className="text-muted-foreground">
                    Select all that apply. You can add quantities in the next step.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tapeFormatOptions.map((format) => (
                    <Card
                      key={format.id}
                      className={`cursor-pointer transition-all ${
                        selectedFormats.includes(format.id)
                          ? "ring-2 ring-accent border-accent"
                          : "hover-elevate"
                      }`}
                      onClick={() => handleFormatToggle(format.id)}
                      data-testid={`card-format-${format.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            selectedFormats.includes(format.id) ? "bg-accent" : "bg-secondary"
                          }`}>
                            <format.icon className={`w-6 h-6 ${
                              selectedFormats.includes(format.id) ? "text-accent-foreground" : "text-muted-foreground"
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
                      Not sure which format you have?
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tape Format Identification Guide</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {tapeFormatOptions.map((format) => (
                        <div key={format.id} className="flex gap-4 p-3 rounded-lg bg-secondary/50">
                          <format.icon className="w-8 h-8 text-muted-foreground flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-foreground">{format.name}</h4>
                            <p className="text-sm text-muted-foreground">{format.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">Era: {format.era}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* Step 2: Quantity */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-step-2-title">
                    How many tapes do you have?
                  </h2>
                  <p className="text-muted-foreground">
                    Adjust the quantity for each format you selected.
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
                    <span className="text-muted-foreground">Total tapes:</span>
                    <span className="text-xl font-bold text-foreground">{totalTapes}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Duration */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-step-3-title">
                    Approximately how many hours of footage?
                  </h2>
                  <p className="text-muted-foreground">
                    This helps us provide an accurate estimate. We only charge for actual footage.
                  </p>
                </div>

                <Card className="bg-accent/10 border-accent/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-accent mt-0.5" />
                      <div>
                        <h4 className="font-medium text-foreground mb-1">How to estimate recording time</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>Check the tape label (T-120 = up to 2hrs in SP mode, 4hrs in LP, 6hrs in EP)</li>
                          <li>Most home recordings used EP/LP mode for longer recording</li>
                          <li>A typical full tape averages 2-4 hours</li>
                          <li>When in doubt, estimate high — we only charge for actual footage</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {durationOptions.map((option) => (
                    <Card
                      key={option.value}
                      className={`cursor-pointer transition-all ${
                        estimatedHours === option.value
                          ? "ring-2 ring-accent border-accent"
                          : "hover-elevate"
                      }`}
                      onClick={() => setEstimatedHours(option.value)}
                      data-testid={`card-duration-${option.value}`}
                    >
                      <CardContent className="p-4 text-center">
                        <span className={`font-medium ${
                          estimatedHours === option.value ? "text-accent" : "text-foreground"
                        }`}>
                          {option.label}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Output Format */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-step-4-title">
                    How would you like to receive your files?
                  </h2>
                  <p className="text-muted-foreground">
                    Digital download is included with every order. Select additional options if desired.
                  </p>
                </div>

                <div className="space-y-3">
                  {outputOptions.map((option) => (
                    <Card
                      key={option.id}
                      className={`cursor-pointer transition-all ${
                        outputFormats.includes(option.id)
                          ? "ring-2 ring-accent border-accent"
                          : option.included ? "opacity-100" : "hover-elevate"
                      }`}
                      onClick={() => handleOutputToggle(option.id)}
                      data-testid={`card-output-${option.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            outputFormats.includes(option.id) ? "bg-accent" : "bg-secondary"
                          }`}>
                            <option.icon className={`w-6 h-6 ${
                              outputFormats.includes(option.id) ? "text-accent-foreground" : "text-muted-foreground"
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground">{option.name}</h3>
                              {option.included && (
                                <Badge variant="secondary" className="text-xs">Required</Badge>
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
                    <Label className="text-foreground mb-2 block">Number of DVD copies</Label>
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

            {/* Step 5: Tape Handling */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-step-5-title">
                    What should we do with your original tapes?
                  </h2>
                  <p className="text-muted-foreground">
                    Choose whether to have your tapes returned or responsibly recycled.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card
                    className={`cursor-pointer transition-all ${
                      tapeHandling === "return"
                        ? "ring-2 ring-accent border-accent"
                        : "hover-elevate"
                    }`}
                    onClick={() => setTapeHandling("return")}
                    data-testid="card-handling-return"
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        tapeHandling === "return" ? "bg-accent" : "bg-secondary"
                      }`}>
                        <Package className={`w-8 h-8 ${
                          tapeHandling === "return" ? "text-accent-foreground" : "text-muted-foreground"
                        }`} />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">Return My Tapes</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        We'll safely package and mail back your originals
                      </p>
                      <span className="font-medium text-foreground">+$5 shipping</span>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all ${
                      tapeHandling === "dispose"
                        ? "ring-2 ring-accent border-accent"
                        : "hover-elevate"
                    }`}
                    onClick={() => setTapeHandling("dispose")}
                    data-testid="card-handling-dispose"
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        tapeHandling === "dispose" ? "bg-accent" : "bg-secondary"
                      }`}>
                        <Recycle className={`w-8 h-8 ${
                          tapeHandling === "dispose" ? "text-accent-foreground" : "text-muted-foreground"
                        }`} />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">Eco-Friendly Disposal</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        We'll responsibly recycle the materials
                      </p>
                      <span className="font-medium text-accent">Free</span>
                    </CardContent>
                  </Card>
                </div>

                <p className="text-sm text-muted-foreground text-center">
                  Many customers choose eco-friendly disposal once their memories are safely digital.
                </p>
              </div>
            )}

            {/* Step 6: Processing Speed */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-step-6-title">
                    When do you need your files?
                  </h2>
                  <p className="text-muted-foreground">
                    Choose your preferred turnaround time.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card
                    className={`cursor-pointer transition-all ${
                      processingSpeed === "standard"
                        ? "ring-2 ring-accent border-accent"
                        : "hover-elevate"
                    }`}
                    onClick={() => setProcessingSpeed("standard")}
                    data-testid="card-speed-standard"
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        processingSpeed === "standard" ? "bg-accent" : "bg-secondary"
                      }`}>
                        <Clock className={`w-8 h-8 ${
                          processingSpeed === "standard" ? "text-accent-foreground" : "text-muted-foreground"
                        }`} />
                      </div>
                      <Badge variant="secondary" className="mb-2">Most Popular</Badge>
                      <h3 className="font-semibold text-foreground mb-2">Standard Processing</h3>
                      <p className="text-sm text-muted-foreground mb-3">2-3 weeks turnaround</p>
                      <span className="font-medium text-accent">Included</span>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all ${
                      processingSpeed === "rush"
                        ? "ring-2 ring-accent border-accent"
                        : "hover-elevate"
                    }`}
                    onClick={() => setProcessingSpeed("rush")}
                    data-testid="card-speed-rush"
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        processingSpeed === "rush" ? "bg-accent" : "bg-secondary"
                      }`}>
                        <Zap className={`w-8 h-8 ${
                          processingSpeed === "rush" ? "text-accent-foreground" : "text-muted-foreground"
                        }`} />
                      </div>
                      <Badge className="bg-accent/20 text-accent mb-2">Priority</Badge>
                      <h3 className="font-semibold text-foreground mb-2">Rush Processing</h3>
                      <p className="text-sm text-muted-foreground mb-3">5 business days</p>
                      <span className="font-medium text-foreground">+50% of order</span>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 7: Review */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-step-7-title">
                    Review Your Order
                  </h2>
                  <p className="text-muted-foreground">
                    Please review your selections before continuing to checkout.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Tapes Summary */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-foreground">Tapes</h3>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentStep(0)} data-testid="button-edit-tapes">
                          <Edit2 className="w-3 h-3 mr-1" /> Edit
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {selectedFormats.map((format) => {
                          const info = tapeFormatOptions.find(f => f.id === format)!;
                          return (
                            <div key={format} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{info.name}</span>
                              <span className="text-foreground">{quantities[format]} tapes</span>
                            </div>
                          );
                        })}
                        <div className="flex justify-between text-sm font-medium pt-2 border-t">
                          <span className="text-foreground">Total tapes</span>
                          <span className="text-foreground">{totalTapes}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Duration & Output */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-foreground">Output Options</h3>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentStep(3)} data-testid="button-edit-output">
                          <Edit2 className="w-3 h-3 mr-1" /> Edit
                        </Button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Estimated footage</span>
                          <span className="text-foreground">{estimatedHours} hours</span>
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

                  {/* Processing */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-foreground">Processing</h3>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentStep(5)} data-testid="button-edit-processing">
                          <Edit2 className="w-3 h-3 mr-1" /> Edit
                        </Button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Speed</span>
                          <span className="text-foreground">
                            {processingSpeed === "rush" ? "Rush (5 days)" : "Standard (2-3 weeks)"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Original tapes</span>
                          <span className="text-foreground">
                            {tapeHandling === "return" ? "Return to me" : "Eco-friendly disposal"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Special Instructions */}
                  <Card>
                    <CardContent className="p-4">
                      <Label htmlFor="instructions" className="font-semibold text-foreground mb-2 block">
                        Special Instructions (Optional)
                      </Label>
                      <Textarea
                        id="instructions"
                        placeholder="E.g., Handle with care - wedding footage"
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
                          This is a gift (ships to different address, no pricing shown)
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {currentStep < STEPS.length - 1 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canProceed}
                  className="bg-accent text-accent-foreground"
                  data-testid="button-continue"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  className="bg-accent text-accent-foreground" 
                  data-testid="button-checkout"
                  onClick={() => {
                    const orderConfig = {
                      tapeFormats: quantities,
                      totalTapes,
                      estimatedHours,
                      outputFormats,
                      dvdQuantity: outputFormats.includes("dvd") ? dvdQuantity : 0,
                      tapeHandling,
                      processingSpeed,
                      specialInstructions,
                      isGift,
                    };
                    localStorage.setItem("orderConfig", JSON.stringify(orderConfig));
                    window.location.href = "/checkout";
                  }}
                >
                  Continue to Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Price Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <Card data-testid="card-price-summary">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>
                  
                  <div className="space-y-3 text-sm">
                    {totalTapes > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base ({totalTapes} tapes)</span>
                        <span className="text-foreground">${pricing.basePrice}</span>
                      </div>
                    )}
                    {estimatedHours > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Footage ({estimatedHours} hrs)</span>
                        <span className="text-foreground">${pricing.hourlyPrice}</span>
                      </div>
                    )}
                    {pricing.usbPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">USB Drive</span>
                        <span className="text-foreground">${pricing.usbPrice}</span>
                      </div>
                    )}
                    {pricing.dvdPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">DVDs ({dvdQuantity})</span>
                        <span className="text-foreground">${pricing.dvdPrice}</span>
                      </div>
                    )}
                    {pricing.cloudPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cloud Storage</span>
                        <span className="text-foreground">${pricing.cloudPrice}</span>
                      </div>
                    )}
                    {pricing.returnPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Return Shipping</span>
                        <span className="text-foreground">${pricing.returnPrice}</span>
                      </div>
                    )}

                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="text-foreground">${pricing.subtotal.toFixed(2)}</span>
                      </div>
                    </div>

                    {pricing.rushFee > 0 && (
                      <div className="flex justify-between text-accent">
                        <span>Rush Processing</span>
                        <span>+${pricing.rushFee.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="font-semibold text-foreground">Estimated Total</span>
                        <span className="text-xl font-bold text-accent">${pricing.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-4">
                    Final price confirmed after tape inspection. We only charge for actual footage.
                  </p>
                </CardContent>
              </Card>

              <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground text-sm">Satisfaction Guaranteed</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Not happy? We'll make it right or refund your money.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
