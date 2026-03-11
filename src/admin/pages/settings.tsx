import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Bitcoin, Wallet, Settings2, Save, Copy, Check, DollarSign, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { getCurrentCurrency, formatCurrency, NGN_TO_USD_RATE, getExchangeRate } from "../utils/export-utils";
import adminApi from "../utils/api";
import { Dialog, DialogContent } from "../components/ui/dialog";

export function Settings() {
  const [vatEnabled, setVatEnabled] = useState(true);
  const [vatRate, setVatRate] = useState("20");
  const [vatNumber, setVatNumber] = useState("GB123456789");
  const [savingVAT, setSavingVAT] = useState(false);
  const [currency, setCurrency] = useState<'NGN' | 'USD'>(() => getCurrentCurrency());
  const [exchangeRate, setExchangeRate] = useState<string>(() => String(getExchangeRate()));
  
  const [btcAddress, setBtcAddress] = useState("");
  const [usdtERC20, setUsdtERC20] = useState("");
  const [usdtBEP20, setUsdtBEP20] = useState("");
  const [usdtTRC20, setUsdtTRC20] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);
  
  const [copiedBtc, setCopiedBtc] = useState(false);
  const [copiedERC20, setCopiedERC20] = useState(false);
  const [copiedBEP20, setCopiedBEP20] = useState(false);
  const [copiedTRC20, setCopiedTRC20] = useState(false);

  const [storeName, setStoreName] = useState("Gems Ore");
  const [storeEmail, setStoreEmail] = useState("admin@gemsore.com");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Load settings from backend on mount
  useEffect(() => {
    adminApi.settings.getAll().then((data: any) => {
      if (data.btc_address) setBtcAddress(data.btc_address);
      if (data.usdt_erc20) setUsdtERC20(data.usdt_erc20);
      if (data.usdt_bep20) setUsdtBEP20(data.usdt_bep20);
      if (data.usdt_trc20) setUsdtTRC20(data.usdt_trc20);
      if (data.vat_enabled !== undefined) setVatEnabled(data.vat_enabled === 'true' || data.vat_enabled === true);
      if (data.vat_rate) setVatRate(data.vat_rate);
      if (data.vat_number) setVatNumber(data.vat_number);
      if (data.store_name) setStoreName(data.store_name);
      if (data.store_email) setStoreEmail(data.store_email);
      if (data.email_notifications !== undefined) setEmailNotifications(data.email_notifications === 'true' || data.email_notifications === true);
      if (data.low_stock_alerts !== undefined) setLowStockAlerts(data.low_stock_alerts === 'true' || data.low_stock_alerts === true);
      if (data.ngn_to_usd_rate) {
        setExchangeRate(data.ngn_to_usd_rate);
        localStorage.setItem('gemsore_exchange_rate', data.ngn_to_usd_rate);
      }
    }).catch(() => {});
  }, []);

  const handleCurrencyChange = (value: 'NGN' | 'USD') => {
    setCurrency(value);
    localStorage.setItem('gemsore_currency', value);
    toast.success(`Currency changed to ${value === 'NGN' ? 'Nigerian Naira (₦)' : 'US Dollar ($)'}`);
    window.dispatchEvent(new Event('gemsore_currency_change'));
  };

  const showSaveSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 2500);
  };

  const handleSaveVAT = async () => {
    setSavingVAT(true);
    try {
      await adminApi.settings.update({
        vat_enabled: String(vatEnabled),
        vat_rate: vatRate,
        vat_number: vatNumber,
      });
      showSaveSuccess("VAT configuration has been saved successfully.");
    } catch {
      toast.error("Failed to save VAT configuration");
    } finally {
      setSavingVAT(false);
    }
  };

  const handleSavePayment = async () => {
    setSavingPayment(true);
    try {
      await adminApi.settings.update({
        btc_address: btcAddress,
        usdt_erc20: usdtERC20,
        usdt_bep20: usdtBEP20,
        usdt_trc20: usdtTRC20,
      });
      showSaveSuccess("Payment settings have been saved successfully.");
    } catch {
      toast.error("Failed to save payment settings");
    } finally {
      setSavingPayment(false);
    }
  };

  const copyToClipboard = (text: string, type: 'btc' | 'erc20' | 'bep20' | 'trc20') => {
    navigator.clipboard.writeText(text);
    if (type === 'btc') {
      setCopiedBtc(true);
      setTimeout(() => setCopiedBtc(false), 2000);
    } else if (type === 'erc20') {
      setCopiedERC20(true);
      setTimeout(() => setCopiedERC20(false), 2000);
    } else if (type === 'bep20') {
      setCopiedBEP20(true);
      setTimeout(() => setCopiedBEP20(false), 2000);
    } else if (type === 'trc20') {
      setCopiedTRC20(true);
      setTimeout(() => setCopiedTRC20(false), 2000);
    }
    toast.success("Address copied to clipboard");
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1.5">Configure your store settings and preferences</p>
      </div>

      <Tabs defaultValue="vat" className="space-y-6">
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="vat">VAT Configuration</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
          <TabsTrigger value="general">General Settings</TabsTrigger>
        </TabsList>

        {/* VAT Configuration */}
        <TabsContent value="vat">
          <Card className="border-0 shadow-sm bg-white rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">VAT Settings</CardTitle>
              <CardDescription className="text-slate-500">
                Configure Value Added Tax settings for your jewelry store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium text-slate-900">Enable VAT</Label>
                  <p className="text-sm text-slate-600">
                    Apply VAT to all product prices
                  </p>
                </div>
                <Switch
                  checked={vatEnabled}
                  onCheckedChange={setVatEnabled}
                />
              </div>

              <Separator className="bg-slate-100" />

              {vatEnabled && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="vatRate" className="text-slate-900">VAT Rate (%)</Label>
                    <Input
                      id="vatRate"
                      type="number"
                      step="0.01"
                      value={vatRate}
                      onChange={(e) => setVatRate(e.target.value)}
                      placeholder="20.00"
                      className="max-w-xs mt-1.5 border-slate-200"
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      Standard VAT rate applied to all taxable items
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="vatNumber" className="text-slate-900">VAT Registration Number</Label>
                    <Input
                      id="vatNumber"
                      value={vatNumber}
                      onChange={(e) => setVatNumber(e.target.value)}
                      placeholder="e.g., GB123456789"
                      className="max-w-xs mt-1.5 border-slate-200"
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      Your business VAT registration number
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <span className="text-lg">💰</span> VAT Calculation Preview
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Product Price:</span>
                        <span className="font-semibold text-blue-900">₦1,000,000.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">VAT ({vatRate}%):</span>
                        <span className="font-semibold text-blue-900">
                          ₦{(1000000 * parseFloat(vatRate || '0') / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <Separator className="my-2 bg-blue-200" />
                      <div className="flex justify-between">
                        <span className="font-semibold text-blue-900">Total Price:</span>
                        <span className="font-bold text-blue-900">
                          ₦{(1000000 + (1000000 * parseFloat(vatRate || '0') / 100)).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveVAT} disabled={savingVAT} className="bg-black text-white hover:bg-slate-800">
                  <Save className="h-4 w-4 mr-2" />
                  {savingVAT ? 'Saving...' : 'Save VAT Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods */}
        <TabsContent value="payment">
          <div className="space-y-6">
            {/* Bitcoin */}
            <Card className="border-0 shadow-sm bg-white rounded-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 rounded-2xl">
                    <Bitcoin className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">Bitcoin (BTC) Wallet</CardTitle>
                    <CardDescription className="text-slate-500">
                      Configure your Bitcoin wallet address for receiving payments
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="btcAddress" className="text-slate-900">BTC Wallet Address</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      id="btcAddress"
                      value={btcAddress}
                      onChange={(e) => setBtcAddress(e.target.value)}
                      placeholder="Enter your BTC wallet address"
                      className="font-mono text-sm border-slate-200"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(btcAddress, 'btc')}
                      className="border-slate-200"
                    >
                      {copiedBtc ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    Customer payments will be sent to this address
                  </p>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-5">
                  <h4 className="font-semibold text-amber-900 mb-2">Important Notice</h4>
                  <ul className="text-sm text-amber-800 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span>Ensure this is a valid Bitcoin address</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span>Double-check the address before saving</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span>Keep your private keys secure</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span>Test with a small transaction first</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* USDT */}
            <Card className="border-0 shadow-sm bg-white rounded-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-2xl">
                    <Wallet className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900">Tether (USDT) Wallet</CardTitle>
                    <CardDescription className="text-slate-500">
                      Configure your USDT wallet address for receiving payments
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="usdtAddress" className="text-slate-900">USDT Wallet Address (ERC-20)</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      id="usdtAddress"
                      value={usdtERC20}
                      onChange={(e) => setUsdtERC20(e.target.value)}
                      placeholder="Enter your USDT wallet address"
                      className="font-mono text-sm border-slate-200"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(usdtERC20, 'erc20')}
                      className="border-slate-200"
                    >
                      {copiedERC20 ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    This should be an Ethereum (ERC-20) compatible address
                  </p>
                </div>

                <div>
                  <Label htmlFor="usdtAddress" className="text-slate-900">USDT Wallet Address (BEP-20)</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      id="usdtAddress"
                      value={usdtBEP20}
                      onChange={(e) => setUsdtBEP20(e.target.value)}
                      placeholder="Enter your USDT wallet address"
                      className="font-mono text-sm border-slate-200"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(usdtBEP20, 'bep20')}
                      className="border-slate-200"
                    >
                      {copiedBEP20 ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    This should be a Binance Smart Chain (BEP-20) compatible address
                  </p>
                </div>

                <div>
                  <Label htmlFor="usdtAddress" className="text-slate-900">USDT Wallet Address (TRC-20)</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      id="usdtAddress"
                      value={usdtTRC20}
                      onChange={(e) => setUsdtTRC20(e.target.value)}
                      placeholder="Enter your USDT wallet address"
                      className="font-mono text-sm border-slate-200"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(usdtTRC20, 'trc20')}
                      className="border-slate-200"
                    >
                      {copiedTRC20 ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    This should be a Tron (TRC-20) compatible address
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-5">
                  <h4 className="font-semibold text-green-900 mb-2">USDT Networks</h4>
                  <p className="text-sm text-green-800 mb-3">
                    Currently configured for ERC-20 network. Other supported networks:
                  </p>
                  <ul className="text-sm text-green-800 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>ERC-20 (Ethereum)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>TRC-20 (Tron)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>BEP-20 (Binance Smart Chain)</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button onClick={handleSavePayment} className="bg-black text-white hover:bg-slate-800">
                <Save className="h-4 w-4 mr-2" />
                Save Payment Settings
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* General Settings */}
        <TabsContent value="general">
          <Card className="border-0 shadow-sm bg-white rounded-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-100 rounded-2xl">
                  <Settings2 className="h-6 w-6 text-slate-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900">General Settings</CardTitle>
                  <CardDescription className="text-slate-500">
                    Configure general store preferences
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="storeName" className="text-slate-900">Store Name</Label>
                <Input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="max-w-md mt-1.5 border-slate-200"
                />
              </div>

              <div>
                <Label htmlFor="storeEmail" className="text-slate-900">Store Email</Label>
                <Input
                  id="storeEmail"
                  type="email"
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                  className="max-w-md mt-1.5 border-slate-200"
                />
              </div>

              <div>
                <Label htmlFor="currency" className="text-slate-900">Default Currency</Label>
                <Select
                  value={currency}
                  onValueChange={handleCurrencyChange}
                >
                  <SelectTrigger className="max-w-xs mt-1.5 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NGN">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">₦</span>
                        <span>Nigerian Naira (NGN)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="USD">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">$</span>
                        <span>US Dollar (USD)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="exchangeRate" className="text-slate-900">Exchange Rate ($1 USD = ? NGN)</Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-sm font-semibold text-slate-600">$1 =</span>
                  <Input
                    id="exchangeRate"
                    type="number"
                    min="1"
                    step="1"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(e.target.value)}
                    className="max-w-[180px] border-slate-200"
                    placeholder="1500"
                  />
                  <span className="text-sm font-semibold text-slate-600">NGN</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  Set how many Naira equals $1 USD. This affects all prices across the storefront when displaying in USD.
                </p>
              </div>

              <Separator className="bg-slate-100" />

              <div className="space-y-4">
                <h4 className="font-medium text-slate-900">Notifications</h4>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="space-y-0.5">
                    <Label className="text-slate-900">Email Notifications</Label>
                    <p className="text-sm text-slate-600">
                      Receive email alerts for new orders
                    </p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="space-y-0.5">
                    <Label className="text-slate-900">Low Stock Alerts</Label>
                    <p className="text-sm text-slate-600">
                      Get notified when products are low in stock
                    </p>
                  </div>
                  <Switch checked={lowStockAlerts} onCheckedChange={setLowStockAlerts} />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button disabled={savingGeneral} onClick={async () => {
                  setSavingGeneral(true);
                  try {
                    // Validate exchange rate
                    const rateNum = Number(exchangeRate);
                    if (!rateNum || rateNum <= 0) {
                      toast.error('Please enter a valid exchange rate');
                      setSavingGeneral(false);
                      return;
                    }

                    await adminApi.settings.update({
                      store_name: storeName,
                      store_email: storeEmail,
                      email_notifications: String(emailNotifications),
                      low_stock_alerts: String(lowStockAlerts),
                      ngn_to_usd_rate: String(rateNum),
                    });

                    // Update localStorage and notify all components
                    localStorage.setItem('gemsore_exchange_rate', String(rateNum));
                    window.dispatchEvent(new Event('gemsore_rate_change'));

                    showSaveSuccess('General settings have been saved successfully.');
                  } catch {
                    toast.error('Failed to save general settings');
                  } finally {
                    setSavingGeneral(false);
                  }
                }} className="bg-black text-white hover:bg-slate-800">
                  <Save className="h-4 w-4 mr-2" />
                  {savingGeneral ? 'Saving...' : 'Save General Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-sm text-center">
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Saved Successfully</h3>
            <p className="text-sm text-slate-500 mb-5">{successMessage}</p>
            <Button
              onClick={() => setShowSuccessModal(false)}
              className="bg-black text-white hover:bg-slate-800 px-8"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}