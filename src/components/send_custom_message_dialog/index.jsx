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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Typography from "@/components/typography";
import { 
  Mail, 
  Bell, 
  Check, 
  ArrowLeft,
  ArrowRight,
  Send,
  User,
  Smartphone
} from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";

// Channel options
const CHANNELS = [
  {
    id: "email",
    name: "Email",
    icon: Mail,
    description: "Send message via email",
    color: "bg-blue-500",
    iconColor: "text-blue-500",
  },
  {
    id: "push_notification",
    name: "Push Notification",
    icon: Bell,
    description: "Send push notification to mobile devices",
    color: "bg-purple-500",
    iconColor: "text-purple-500",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: WhatsAppIcon,
    description: "Send message via WhatsApp",
    color: "bg-emerald-500",
    iconColor: "text-emerald-500",
  },
];

const SendCustomMessageDialog = ({ 
  open, 
  onClose, 
  users = [],
  onSend,
  isSending = false
}) => {
  const [step, setStep] = useState(1);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleClose = () => {
    setStep(1);
    setSelectedChannel(null);
    setTitle("");
    setBody("");
    onClose();
  };

  const handleNext = () => {
    if (step === 1 && selectedChannel) {
      setStep(2);
    } else if (step === 2 && title.trim() && body.trim()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSend = async () => {
    if (onSend && selectedChannel && title.trim() && body.trim()) {
      await onSend({
        channel: selectedChannel,
        title: title.trim(),
        body: body.trim(),
        users,
      });
    }
    handleClose();
  };

  const isStep1Valid = selectedChannel !== null;
  const isStep2Valid = title.trim().length > 0 && body.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="min-w-[80vw] max-w-[80vw] h-[80vh] p-0 flex flex-col">
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Vertical Stepper */}
          <div className="w-48 bg-gray-50 dark:bg-gray-900 p-6 flex flex-col border-r flex-shrink-0">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </div>
            </div>

            {/* Vertical Steps */}
            <div className="flex flex-col gap-0 flex-1">
              {[
                { num: 1, label: 'Select Channel' },
                { num: 2, label: 'Enter Message' },
                { num: 3, label: 'Confirm & Send' }
              ].map((stepItem, idx) => (
                <div key={stepItem.num} className="flex flex-col items-start">
                  <div className="flex items-center gap-3 py-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                      step >= stepItem.num 
                        ? 'border-primary bg-primary text-white' 
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      {step > stepItem.num ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs font-medium ${
                        step >= stepItem.num ? 'text-primary' : 'text-gray-500'
                      }`}>
                        Step {idx + 1}
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

            {/* User Count Badge */}
            {users.length > 0 && (
              <div className="mt-auto pt-4 border-t">
                <Badge variant="secondary" className="w-full justify-center">
                  {users.length} {users.length === 1 ? 'User' : 'Users'}
                </Badge>
              </div>
            )}
          </div>

          {/* Right Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="p-6 pb-4 border-b flex-shrink-0">
              <DialogDescription>
                Follow the steps to send a custom message to your users
              </DialogDescription>
            </div>

            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              {/* Step 1: Select Channel */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <Typography variant="h4" className="mb-2">Select Channel</Typography>
                    <Typography className="text-sm text-gray-600">
                      Choose how you want to send your message
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

              {/* Step 2: Enter Message */}
              {step === 2 && selectedChannel && (
                <div className="space-y-6 max-w-3xl">
                  <div>
                    <Typography variant="h4" className="mb-2">Enter Message</Typography>
                    <Typography className="text-sm text-gray-600">
                      Compose your message for {selectedChannel.name}
                    </Typography>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">
                        Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        placeholder="Enter message title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={100}
                      />
                      <Typography className="text-xs text-gray-500">
                        {title.length}/100 characters
                      </Typography>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="body">
                        Message Body <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="body"
                        placeholder="Enter your message content"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={8}
                        className="resize-none"
                      />
                      <Typography className="text-xs text-gray-500">
                        {body.length} characters
                      </Typography>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Typography className="text-sm font-medium mb-2">Preview:</Typography>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                        <Typography className="font-semibold mb-2">
                          {title || "Message Title"}
                        </Typography>
                        <Typography className="text-sm whitespace-pre-wrap">
                          {body || "Your message content will appear here..."}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Preview & Send */}
              {step === 3 && selectedChannel && (
                <div className="space-y-4 max-w-3xl">
                  <div>
                    <Typography variant="h4" className="mb-2">Preview & Send</Typography>
                    <Typography className="text-sm text-gray-600">
                      Review your message before sending
                    </Typography>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {selectedChannel.icon && (() => {
                          const Icon = selectedChannel.icon;
                          return <Icon className="w-4 h-4 text-blue-600" />;
                        })()}
                        <Typography className="text-sm font-medium">Channel</Typography>
                      </div>
                      <Typography className="font-semibold">
                        {selectedChannel.name}
                      </Typography>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-green-600" />
                        <Typography className="text-sm font-medium">Recipients</Typography>
                      </div>
                      <Typography className="font-semibold">
                        {users.length} {users.length === 1 ? 'User' : 'Users'}
                      </Typography>
                    </div>
                  </div>

                  {/* Message Preview */}
                  <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-900">
                    <Typography className="text-sm text-gray-500 mb-4">Message Preview</Typography>
                    
                    <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                      <Typography className="font-semibold mb-3 text-lg">
                        {title}
                      </Typography>
                      <Typography className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                        {body}
                      </Typography>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <DialogFooter className="flex justify-between items-center p-6 border-t flex-shrink-0">
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
                    disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}
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
                    {isSending ? 'Sending...' : `Send to ${users.length} ${users.length === 1 ? 'User' : 'Users'}`}
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

export default SendCustomMessageDialog;

