import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Typography from "@/components/typography";
import { 
  Mail, 
  MessageSquare, 
  Check, 
  ArrowLeft,
  ArrowRight,
  Send,
  User,
  ShoppingCart,
  Calendar
} from "lucide-react";
import { formatPrice } from "@/utils/format_price";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";

// Channel options
const CHANNELS = [
  {
    id: "email",
    name: "Email",
    icon: Mail,
    description: "Send reminder via email",
    color: "bg-blue-500",
    iconColor: "text-blue-500",
  },
  {
    id: "sms",
    name: "SMS",
    icon: MessageSquare,
    description: "Send reminder via text message",
    color: "bg-green-500",
    iconColor: "text-green-500",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: WhatsAppIcon,
    description: "Send reminder via WhatsApp",
    color: "bg-emerald-500",
    iconColor: "text-emerald-500",
  },
];

// Template options per channel
const TEMPLATES = {
  email: [
    {
      id: "cart_reminder_1",
      name: "Friendly Reminder",
      subject: "Don't forget your items!",
      preview: "Hi {{name}}, You left {{itemCount}} items in your cart. Complete your purchase now!",
      body: `Hi {{name}},

We noticed you left {{itemCount}} items in your cart worth {{totalAmount}}.

Don't miss out on these great products! Complete your purchase now and get them delivered to your doorstep.

Your Cart Items:
{{itemsList}}

Click here to complete your purchase: {{checkoutLink}}

Best regards,
Pet Caart Team`,
    },
    {
      id: "cart_reminder_2",
      name: "Urgent Reminder",
      subject: "Your cart is waiting - Limited stock!",
      preview: "Hurry! Items in your cart are running out of stock.",
      body: `Hi {{name}},

HURRY! The items in your cart are in high demand and stock is running low.

Cart Total: {{totalAmount}}
Items: {{itemCount}}

{{itemsList}}

Don't miss out - complete your purchase now before they're gone!

{{checkoutLink}}

Pet Caart Team`,
    },
    {
      id: "cart_reminder_3",
      name: "Special Discount",
      subject: "Special 10% OFF on your cart!",
      preview: "Complete your purchase and get 10% discount!",
      body: `Hi {{name}},

Great news! We're offering you a special 10% discount on your abandoned cart.

Original Total: {{totalAmount}}
After Discount: {{discountedAmount}}

Your Cart:
{{itemsList}}

Use code: COMPLETE10

Complete your purchase: {{checkoutLink}}

Offer valid for 24 hours only!

Pet Caart Team`,
    },
  ],
  sms: [
    {
      id: "sms_reminder_1",
      name: "Short Reminder",
      preview: "Hi {{name}}, you left {{itemCount}} items worth {{totalAmount}} in your cart. Complete now: {{link}}",
    },
    {
      id: "sms_reminder_2",
      name: "Discount Reminder",
      preview: "{{name}}, get 10% OFF on your {{totalAmount}} cart! Use code SAVE10. Shop: {{link}}",
    },
  ],
  whatsapp: [
    {
      id: "whatsapp_reminder_1",
      name: "Cart Reminder",
      preview: "🛒 Hi {{name}}! You have {{itemCount}} items waiting in your cart ({{totalAmount}}). Complete your order: {{link}}",
    },
    {
      id: "whatsapp_reminder_2",
      name: "Personalized Message",
      preview: "Hey {{name}}! 🐾 Your pets are waiting! Complete your {{totalAmount}} order and get free delivery. {{link}}",
    },
  ],
};

const SendReminderDialog = ({ 
  open, 
  onClose, 
  customers = [],
  onSend,
  isSending = false
}) => {
  const [step, setStep] = useState(1);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleClose = () => {
    setStep(1);
    setSelectedChannel(null);
    setSelectedTemplate(null);
    onClose();
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSend = async () => {
    if (onSend) {
      await onSend({
        channel: selectedChannel,
        template: selectedTemplate,
        customers,
      });
    }
    handleClose();
  };

  const renderVariables = (text, customer) => {
    if (!customer) return text;
    
    const itemCount = customer.items?.length || 0;
    const totalAmount = formatPrice(customer.total_price || 0);
    const itemsList = customer.items?.slice(0, 3).map((item, idx) => 
      `${idx + 1}. ${item?.productId?.title} (${item?.quantity}x) - ${formatPrice(item?.total)}`
    ).join('\n') || '';

    return text
      .replace(/{{name}}/g, customer?.userId?.name || 'Customer')
      .replace(/{{itemCount}}/g, itemCount)
      .replace(/{{totalAmount}}/g, totalAmount)
      .replace(/{{itemsList}}/g, itemsList)
      .replace(/{{checkoutLink}}/g, 'https://petcaart.com/checkout')
      .replace(/{{link}}/g, 'https://petcaart.com/cart')
      .replace(/{{discountedAmount}}/g, formatPrice((customer.total_price || 0) * 0.9));
  };

  const currentCustomer = customers[0]; // For preview, use first customer

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="min-w-[80vw] max-w-[80vw] min-h-[80vh] max-h-[80vh] overflow-hidden p-0">
        <div className="flex h-full">
          {/* Left Sidebar - Vertical Stepper */}
          <div className="w-48 bg-gray-50 dark:bg-gray-900 p-6 flex flex-col border-r">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Send className="w-3.5 h-3.5" />
                <span>Send Reminder</span>
              </div>
            </div>

            {/* Vertical Steps */}
            <div className="flex flex-col gap-0 flex-1">
              {[
                { num: 1, label: 'Select Channel' },
                { num: 2, label: 'Choose Template' },
                { num: 3, label: 'Preview & Send' }
              ].map((stepItem, idx) => (
                <div key={stepItem.num} className="flex flex-col items-start">
                  <div className="flex items-center gap-3 py-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                      step >= stepItem.num 
                        ? 'border-primary bg-primary text-white' 
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      {step > stepItem.num ? <Check className="w-4 h-4" /> : stepItem.num}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs font-medium ${
                        step >= stepItem.num ? 'text-primary' : 'text-gray-500'
                      }`}>
                        Step {stepItem.num}
                      </span>
                      <span className={`text-xs ${
                        step >= stepItem.num ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500'
                      }`}>
                        {stepItem.label}
                      </span>
                    </div>
                  </div>
                  {idx < 2 && (
                    <div className={`w-0.5 h-8 ml-4 ${step > stepItem.num ? 'bg-primary' : 'bg-gray-300'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Customer Count Badge */}
            {customers.length > 0 && (
              <div className="mt-auto pt-4 border-t">
                <Badge variant="secondary" className="w-full justify-center">
                  {customers.length} {customers.length === 1 ? 'Customer' : 'Customers'}
                </Badge>
              </div>
            )}
          </div>

          {/* Right Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 pb-4 border-b">
              <DialogDescription>
                Follow the steps to send a personalized reminder to your customers
              </DialogDescription>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Select Channel */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Typography variant="h4" className="mb-2">Select Channel</Typography>
                <Typography className="text-sm text-gray-600">
                  Choose how you want to reach out to your customers
                </Typography>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CHANNELS.map((channel) => {
                  const Icon = channel.icon;
                  const isSelected = selectedChannel?.id === channel.id;
                  
                  return (
                    <div
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <Check className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      
                      <div className={`w-12 h-12 rounded-full bg-opacity-10 flex items-center justify-center mb-3 ${channel.color.replace('bg-', 'bg-').concat('/10')}`}>
                        <Icon className={`w-6 h-6 ${channel.iconColor}`} />
                      </div>
                      
                      <Typography className="font-semibold mb-1">
                        {channel.name}
                      </Typography>
                      <Typography className="text-sm text-gray-600">
                        {channel.description}
                      </Typography>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Select Template */}
          {step === 2 && selectedChannel && (
            <div className="space-y-4">
              <div>
                <Typography variant="h4" className="mb-2">Select Template</Typography>
                <Typography className="text-sm text-gray-600">
                  Choose a pre-designed template for {selectedChannel.name}
                </Typography>
              </div>
              
              <div className="space-y-3">
                {TEMPLATES[selectedChannel.id]?.map((template) => {
                  const isSelected = selectedTemplate?.id === template.id;
                  
                  return (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Typography className="font-semibold">
                              {template.name}
                            </Typography>
                            {isSelected && (
                              <Check className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          {template.subject && (
                            <Typography className="text-sm font-medium text-gray-700 mb-1">
                              Subject: {template.subject}
                            </Typography>
                          )}
                          <Typography className="text-sm text-gray-600">
                            {renderVariables(template.preview, currentCustomer)}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 3 && selectedChannel && selectedTemplate && (
            <div className="space-y-4">
              <div>
                <Typography variant="h4" className="mb-2">Preview & Send</Typography>
                <Typography className="text-sm text-gray-600">
                  Review your message before sending
                </Typography>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedChannel.icon && <selectedChannel.icon className="w-4 h-4 text-blue-600" />}
                    <Typography className="text-sm font-medium">Channel</Typography>
                  </div>
                  <Typography className="font-semibold">{selectedChannel.name}</Typography>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-green-600" />
                    <Typography className="text-sm font-medium">Recipients</Typography>
                  </div>
                  <Typography className="font-semibold">
                    {customers.length} {customers.length === 1 ? 'Customer' : 'Customers'}
                  </Typography>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-purple-600" />
                    <Typography className="text-sm font-medium">Template</Typography>
                  </div>
                  <Typography className="font-semibold">{selectedTemplate.name}</Typography>
                </div>
              </div>

              {/* Message Preview */}
              <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-900">
                <Typography className="text-sm text-gray-500 mb-4">Message Preview</Typography>
                
                {selectedTemplate.subject && (
                  <div className="mb-4">
                    <Typography className="text-xs text-gray-500 mb-1">Subject:</Typography>
                    <Typography className="font-semibold">
                      {renderVariables(selectedTemplate.subject, currentCustomer)}
                    </Typography>
                  </div>
                )}
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {renderVariables(selectedTemplate.body || selectedTemplate.preview, currentCustomer)}
                  </pre>
                </div>

                {currentCustomer && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <Typography className="text-xs text-gray-600 mb-2">Customer Details:</Typography>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Name:</span> {currentCustomer?.userId?.name || 'N/A'}
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span> {currentCustomer?.userId?.email || 'N/A'}
                      </div>
                      <div>
                        <span className="text-gray-500">Items:</span> {currentCustomer?.items?.length || 0}
                      </div>
                      <div>
                        <span className="text-gray-500">Total:</span> {formatPrice(currentCustomer?.total_price || 0)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
            </div>

            {/* Footer */}
            <DialogFooter className="flex justify-between items-center p-6 border-t">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            
            {step < 3 ? (
              <Button 
                onClick={handleNext}
                disabled={
                  (step === 1 && !selectedChannel) ||
                  (step === 2 && !selectedTemplate)
                }
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSend}
                disabled={isSending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSending ? 'Sending...' : `Send to ${customers.length} ${customers.length === 1 ? 'Customer' : 'Customers'}`}
              </Button>
            )}
              </div>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendReminderDialog;

