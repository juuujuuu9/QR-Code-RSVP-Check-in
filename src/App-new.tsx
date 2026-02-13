import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, QrCode, Users, Calendar, Mail, Building2, Search, Download, Trash2, X, Camera, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import type { Attendee, RSVPFormData, CheckInResult } from '@/types/attendee';
import { apiService } from '@/services/api';
import './App.css';

function App() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [activeTab, setActiveTab] = useState('rsvp');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load attendees from API
  useEffect(() => {
    loadAttendees();
  }, []);

  const loadAttendees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAllAttendees();
      setAttendees(data);
    } catch (error) {
      console.error('Error loading attendees:', error);
      setError('Failed to load attendees');
      toast.error('Failed to load attendees');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Event RSVP & Check-in</h1>
                <p className="text-xs text-slate-500">Manage your event attendees</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-sm">
                <Users className="h-4 w-4 mr-1" />
                {attendees.length} Total
              </Badge>
              <Badge variant="default" className="text-sm bg-green-600">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                {attendees.filter(a => a.checkedIn).length} Checked In
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-slate-600">Loading...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p>{error}</p>
            <Button onClick={loadAttendees} variant="outline" size="sm" className="mt-2">
              Retry
            </Button>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="rsvp">RSVP Form</TabsTrigger>
            <TabsTrigger value="checkin">Check-in</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="rsvp" className="space-y-6">
            <RSVPForm 
              onSuccess={async () => {
                await loadAttendees();
                setActiveTab('admin');
              }} 
            />
          </TabsContent>

          <TabsContent value="checkin" className="space-y-6">
            <CheckInScanner 
              onCheckIn={async () => {
                await loadAttendees();
              }}
            />
          </TabsContent>

          <TabsContent value="admin" className="space-y-6">
            <AdminDashboard 
              attendees={attendees}
              onDelete={async () => {
                await loadAttendees();
              }}
              onRefresh={loadAttendees}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// RSVP Form Component
function RSVPForm({ onSuccess: _onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState<RSVPFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    dietaryRestrictions: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedQR, setGeneratedQR] = useState<string>('');
  const [newAttendee, setNewAttendee] = useState<Attendee | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create attendee via API
      const result = await apiService.createAttendee(formData);

      // Handle duplicate email gracefully
      if ('ok' in result && !result.ok) {
        toast.info(result.message); // “Email already registered”
        setLoading(false);
        return;
      }

      // Success path
      const attendee = result as Attendee;
      setNewAttendee(attendee);

      // Generate QR code
      const qrData = JSON.stringify({ id: attendee.id, email: attendee.email });
      const qrCodeDataUrl = await generateQRCode(qrData);
      setGeneratedQR(qrCodeDataUrl);

      // Show preview
      setShowPreview(true);
      toast.success('Registration successful!');

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        dietaryRestrictions: ''
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Rest of the RSVP form component remains the same...
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Event Registration</CardTitle>
          <CardDescription>
            Fill out the form below to register for the event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
              <Input
                id="dietaryRestrictions"
                value={formData.dietaryRestrictions}
                onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                placeholder="e.g., Vegetarian, Vegan, Gluten-free"
                disabled={loading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
            <CardDescription>
              Details about the upcoming event
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-slate-500 mt-0.5" />
              <div>
                <p className="font-medium">Date & Time</p>
                <p className="text-sm text-slate-600">March 15, 2024 • 6:00 PM - 9:00 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-slate-500 mt-0.5" />
              <div>
                <p className="font-medium">Venue</p>
                <p className="text-sm text-slate-600">Tech Innovation Center<br />123 Main Street, San Francisco, CA</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-slate-500 mt-0.5" />
              <div>
                <p className="font-medium">Contact</p>
                <p className="text-sm text-slate-600">events@yourcompany.com</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registration Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registration Successful!</DialogTitle>
            <DialogDescription>
              Your QR code has been generated. Save this for check-in at the event.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {newAttendee && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Registration Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Name</p>
                    <p className="font-medium">{newAttendee.firstName} {newAttendee.lastName}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Email</p>
                    <p className="font-medium">{newAttendee.email}</p>
                  </div>
                  {newAttendee.company && (
                    <div>
                      <p className="text-slate-600">Company</p>
                      <p className="font-medium">{newAttendee.company}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-slate-600">Registration Date</p>
                    <p className="font-medium">{new Date(newAttendee.rsvpAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
            
            {generatedQR && (
              <div className="text-center">
                <img src={generatedQR} alt="QR Code" className="mx-auto mb-4" />
                <Button 
                  onClick={async () => {
                    if (newAttendee) {
                      try {
                        await apiService.sendEmail(newAttendee.id, generatedQR);
                        toast.success('Email sent successfully!');
                      } catch (error) {
                        toast.error('Failed to send email');
                      }
                    }
                  }}
                  variant="outline"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send QR Code to Email
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Check-in Scanner Component
function CheckInScanner({ onCheckIn }: { onCheckIn: () => void }) {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<CheckInResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);

  const startScanning = async () => {
    try {
      setScanning(true);
      setCameraError(null);
      setScanResult(null);

      const Html5Qrcode = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode.Html5Qrcode('reader');
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        async (decodedText: string) => {
          try {
            const result = await apiService.checkInAttendee(decodedText);
            setScanResult(result);
            
            if (result.success) {
              toast.success(result.message);
              onCheckIn();
            } else {
              toast.error(result.message);
            }
            
            stopScanning();
          } catch (error) {
            console.error('Check-in error:', error);
            toast.error('Check-in failed');
          }
        },
        (_errorMessage: string) => {
          // Ignore scanning errors, they're normal while searching
        }
      );
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError('Unable to access camera. Please ensure you have granted camera permissions.');
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().catch(console.error);
      html5QrCodeRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  // Rest of the scanner component remains the same...
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>QR Code Scanner</CardTitle>
          <CardDescription>
            Point your camera at the attendee's QR code to check them in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div 
              id="reader" 
              ref={scannerRef}
              className="w-full border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50"
              style={{ minHeight: '300px' }}
            >
              {!scanning && (
                <div className="text-center text-slate-500">
                  <Camera className="h-12 w-12 mx-auto mb-2" />
                  <p>Click "Start Scanning" to activate camera</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {!scanning ? (
                <Button onClick={startScanning} className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  Start Scanning
                </Button>
              ) : (
                <Button onClick={stopScanning} variant="destructive" className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  Stop Scanning
                </Button>
              )}
              <Button 
                onClick={() => setScanResult(null)} 
                variant="outline"
                disabled={scanning}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {cameraError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="text-sm">{cameraError}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scan Results</CardTitle>
          <CardDescription>
            Results from the latest QR code scan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scanResult ? (
            <div className={`p-4 rounded-lg ${scanResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className={`h-5 w-5 ${scanResult.success ? 'text-green-600' : 'text-red-600'}`} />
                <p className={`font-medium ${scanResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {scanResult.success ? 'Check-in Successful!' : 'Check-in Failed'}
                </p>
              </div>
              <p className={`text-sm ${scanResult.success ? 'text-green-700' : 'text-red-700'}`}>
                {scanResult.message}
              </p>
              {scanResult.attendee && (
                <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                  <p className="text-sm font-medium mb-2">Attendee Details:</p>
                  <div className="text-sm space-y-1">
                    <p><strong>Name:</strong> {scanResult.attendee.firstName} {scanResult.attendee.lastName}</p>
                    <p><strong>Email:</strong> {scanResult.attendee.email}</p>
                    {scanResult.attendee.company && (
                      <p><strong>Company:</strong> {scanResult.attendee.company}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-8">
              <QrCode className="h-12 w-12 mx-auto mb-2" />
              <p>No scan results yet</p>
              <p className="text-sm">Start scanning to see results here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Admin Dashboard Component
function AdminDashboard({ attendees, onDelete, onRefresh }: { 
  attendees: Attendee[], 
  onDelete: () => void,
  onRefresh: () => void
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);
  const [showQR, setShowQR] = useState(false);

  const filteredAttendees = attendees.filter(attendee =>
    attendee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (attendee.company ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Dietary Restrictions', 'Checked In', 'Check-in Time', 'Registration Date'];
    const csvContent = [
      headers.join(','),
      ...filteredAttendees.map(attendee => [
        attendee.firstName,
        attendee.lastName,
        attendee.email,
        attendee.phone,
        attendee.company ?? '',
        attendee.dietaryRestrictions,
        attendee.checkedIn ? 'Yes' : 'No',
        attendee.checkedInAt ? new Date(attendee.checkedInAt).toLocaleString() : '',
        new Date(attendee.rsvpAt).toLocaleDateString()
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-attendees-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this attendee?')) {
      try {
        await apiService.deleteAttendee(id);
        toast.success('Attendee deleted successfully');
        onDelete();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete attendee');
      }
    }
  };

  const generateQRCode = async (attendee: Attendee) => {
    const qrData = JSON.stringify({ id: attendee.id, email: attendee.email });
    return generateQRCodeDataUrl(qrData);
  };

  // Rest of the admin component remains the same...
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {attendees.filter(a => a.checkedIn).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {attendees.filter(a => !a.checkedIn).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-in Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {attendees.length > 0 ? Math.round((attendees.filter(a => a.checkedIn).length / attendees.length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search attendees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
        <Button onClick={onRefresh} variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Attendees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendee List</CardTitle>
          <CardDescription>
            {filteredAttendees.length} of {attendees.length} attendees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendees.map((attendee) => (
                  <TableRow key={attendee.id}>
                    <TableCell className="font-medium">
                      {attendee.firstName} {attendee.lastName}
                    </TableCell>
                    <TableCell>{attendee.email}</TableCell>
                    <TableCell>{attendee.company || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={attendee.checkedIn ? 'default' : 'secondary'}>
                        {attendee.checkedIn ? 'Checked In' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(attendee.rsvpAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            await generateQRCode(attendee);
                            setSelectedAttendee(attendee);
                            setShowQR(true);
                          }}
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(attendee.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
            <DialogDescription>
              QR code for {selectedAttendee?.firstName} {selectedAttendee?.lastName}
            </DialogDescription>
          </DialogHeader>
          {selectedAttendee && (
            <div className="text-center space-y-4">
              <img 
                src={generateQRCode(selectedAttendee) as any} 
                alt="QR Code" 
                className="mx-auto" 
              />
              <div className="text-sm text-slate-600">
                <p>{selectedAttendee.email}</p>
                <p>ID: {selectedAttendee.id}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to generate QR code
function generateQRCode(data: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const QRCode = (window as any).QRCode;
    if (!QRCode) {
      reject(new Error('QRCode library not loaded'));
      return;
    }
    
    const qr = new QRCode.qrcode(0, 'L');
    qr.addData(data);
    qr.make();
    
    const moduleCount = qr.getModuleCount();
    const cellSize = 4;
    const margin = cellSize * 4;
    const size = moduleCount * cellSize + margin * 2;
    
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Failed to create canvas context'));
      return;
    }
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    // Black modules
    ctx.fillStyle = '#000000';
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (qr.isDark(row, col)) {
          ctx.fillRect(
            margin + col * cellSize,
            margin + row * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }
    
    resolve(canvas.toDataURL());
  });
}

function generateQRCodeDataUrl(data: string): Promise<string> {
  return generateQRCode(data);
}

export default App;