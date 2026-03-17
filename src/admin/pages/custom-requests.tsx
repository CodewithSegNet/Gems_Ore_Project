import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Search, Mail, Phone, User, Calendar, MessageSquare } from "lucide-react";
import { formatDate } from "../utils/export-utils";
import { toast } from "sonner";
import adminApi from "../utils/api";

type CustomRequest = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  description: string;
  status: 'pending' | 'contacted' | 'completed';
  submittedDate: string;
};

export function CustomRequests() {
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'contacted' | 'completed'>('all');
  const [selectedRequest, setSelectedRequest] = useState<CustomRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchRequests = async () => {
    try {
      const params: Record<string, string> = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      const data = await adminApi.customRequests.getAll(Object.keys(params).length > 0 ? params : undefined);
      const mapped = data.map((r: any) => ({
        id: r.id,
        fullName: r.full_name || 'Unknown',
        email: r.email || '',
        phoneNumber: r.phone_number || '',
        description: r.description || '',
        status: r.status || 'pending',
        submittedDate: r.created_at || new Date().toISOString(),
      }));
      setRequests(mapped);
    } catch (e) {
      toast.error("Failed to fetch custom requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.phoneNumber.includes(searchTerm) ||
                         request.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleStatusChange = async (requestId: string, newStatus: 'pending' | 'contacted' | 'completed') => {
    try {
      await adminApi.customRequests.updateStatus(requestId, newStatus);
      await fetchRequests();
      toast.success(`Request status updated to ${newStatus}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to update status");
    }
  };

  const handleViewDetails = (request: CustomRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'contacted':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const statusCounts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    contacted: requests.filter(r => r.status === 'contacted').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Custom Requests</h1>
        <p className="text-slate-500 mt-1.5">View and manage custom jewelry requests from customers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm bg-white rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Requests</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">{statusCounts.all}</p>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Pending</p>
                <p className="text-2xl font-semibold text-yellow-600 mt-1">{statusCounts.pending}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Contacted</p>
                <p className="text-2xl font-semibold text-blue-600 mt-1">{statusCounts.contacted}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Completed</p>
                <p className="text-2xl font-semibold text-green-600 mt-1">{statusCounts.completed}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                <User className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm bg-white rounded-xl">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, email, phone, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                className={filterStatus === 'all' ? 'bg-black text-white hover:bg-slate-800' : ''}
              >
                All ({statusCounts.all})
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
                className={filterStatus === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
              >
                Pending ({statusCounts.pending})
              </Button>
              <Button
                variant={filterStatus === 'contacted' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('contacted')}
                className={filterStatus === 'contacted' ? 'bg-blue-500 hover:bg-blue-600' : ''}
              >
                Contacted ({statusCounts.contacted})
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('completed')}
                className={filterStatus === 'completed' ? 'bg-green-500 hover:bg-green-600' : ''}
              >
                Completed ({statusCounts.completed})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card className="border-0 shadow-sm bg-white rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900">
            {filterStatus === 'all' ? 'All Requests' : `${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Requests`} ({filteredRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100">
                <TableHead className="text-slate-600">ID</TableHead>
                <TableHead className="text-slate-600">Full Name</TableHead>
                <TableHead className="text-slate-600">Email</TableHead>
                <TableHead className="text-slate-600">Phone Number</TableHead>
                <TableHead className="text-slate-600">Status</TableHead>
                <TableHead className="text-slate-600">Submitted Date</TableHead>
                <TableHead className="text-right text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => (
                  <TableRow key={request.id} className="border-slate-100">
                    <TableCell className="font-mono text-sm text-slate-600 ">{request.id}</TableCell>
                    <TableCell className="font-medium text-slate-900 truncate">{request.fullName}</TableCell>
                    <TableCell className="text-slate-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400 truncate" />
                        {request.email}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400" />
                        {request.phoneNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">{formatDate(request.submittedDate)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(request)}
                          className="hover:bg-slate-50"
                        >
                          View Details
                        </Button>
                        {request.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(request.id, 'contacted')}
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            Mark Contacted
                          </Button>
                        )}
                        {request.status === 'contacted' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(request.id, 'completed')}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Mark Completed
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>Customer custom jewelry request information</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Request ID</p>
                  <p className="font-mono text-sm font-medium text-slate-900 truncate">{selectedRequest.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Status</p>
                  <Badge className={getStatusColor(selectedRequest.status)}>
                    {selectedRequest.status}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Full Name</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  <p className="font-medium text-slate-900">{selectedRequest.fullName}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Email Address</p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <a href={`mailto:${selectedRequest.email}`} className="text-blue-600 hover:underline">
                    {selectedRequest.email}
                  </a>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Phone Number</p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <a href={`tel:${selectedRequest.phoneNumber}`} className="text-blue-600 hover:underline">
                    {selectedRequest.phoneNumber}
                  </a>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">Submitted Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <p className="text-slate-900">{formatDate(selectedRequest.submittedDate)}</p>
                </div>
              </div>

              {selectedRequest.description && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Description</p>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-slate-900">{selectedRequest.description}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4 border-t">
                {selectedRequest.status === 'pending' && (
                  <Button
                    onClick={() => {
                      handleStatusChange(selectedRequest.id, 'contacted');
                      setIsDialogOpen(false);
                    }}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Mark as Contacted
                  </Button>
                )}
                {selectedRequest.status === 'contacted' && (
                  <Button
                    onClick={() => {
                      handleStatusChange(selectedRequest.id, 'completed');
                      setIsDialogOpen(false);
                    }}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Mark as Completed
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}