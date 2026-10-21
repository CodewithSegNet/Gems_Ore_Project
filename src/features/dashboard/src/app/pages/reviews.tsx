import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Search, Star, Check, X, MessageSquare } from "lucide-react";
import { mockReviews, mockProducts, Review } from "../utils/mock-data";
import { formatDate } from "../utils/export-utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>(() => {
    const stored = localStorage.getItem('gemsore_reviews');
    return stored ? JSON.parse(stored) : mockReviews;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  // Persist reviews to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('gemsore_reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Helper function to get product image
  const getProductImage = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    return product?.image || '';
  };

  // Filter reviews based on search
  const filteredReviews = (status?: Review['status']) => {
    let filtered = reviews;
    
    if (status) {
      filtered = filtered.filter(r => r.status === status);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const handleApprove = (reviewId: string) => {
    setReviews(reviews.map(r =>
      r.id === reviewId ? { ...r, status: 'approved' as const } : r
    ));
    toast.success("Review approved and will be visible on the website");
  };

  const handleReject = (reviewId: string) => {
    setReviews(reviews.map(r =>
      r.id === reviewId ? { ...r, status: 'rejected' as const } : r
    ));
    toast.error("Review rejected and will not be visible on the website");
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: Review['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    
    return (
      <Badge className={`${styles[status]} border-0`}>
        {status}
      </Badge>
    );
  };

  const viewReviewDetails = (review: Review) => {
    setSelectedReview(review);
    setShowDialog(true);
  };

  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const approvedCount = reviews.filter(r => r.status === 'approved').length;
  const rejectedCount = reviews.filter(r => r.status === 'rejected').length;

  const renderReviewsTable = (reviewsList: Review[]) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-100">
            <TableHead className="text-slate-600 w-[100px]">Review ID</TableHead>
            <TableHead className="text-slate-600 w-[200px]">Product</TableHead>
            <TableHead className="text-slate-600 w-[180px]">Customer</TableHead>
            <TableHead className="text-slate-600 w-[120px]">Rating</TableHead>
            <TableHead className="text-slate-600 min-w-[200px]">Comment</TableHead>
            <TableHead className="text-slate-600 w-[100px]">Date</TableHead>
            <TableHead className="text-slate-600 w-[100px]">Status</TableHead>
            <TableHead className="text-slate-600 w-[180px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviewsList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                No reviews found
              </TableCell>
            </TableRow>
          ) : (
            reviewsList.map((review) => (
              <TableRow key={review.id} className="border-slate-100">
                <TableCell className="font-mono text-slate-600">{review.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <img 
                      src={getProductImage(review.productId)} 
                      alt={review.productName}
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                    />
                    <span className="font-medium text-slate-900 truncate">{review.productName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-slate-900">{review.customer}</p>
                    <p className="text-sm text-slate-500">{review.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {renderStars(review.rating)}
                </TableCell>
                <TableCell className="max-w-[300px]">
                  <p className="text-slate-600 truncate">{review.comment}</p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-amber-600 hover:text-amber-700"
                    onClick={() => viewReviewDetails(review)}
                  >
                    Read more
                  </Button>
                </TableCell>
                <TableCell className="text-slate-600">{formatDate(review.date)}</TableCell>
                <TableCell>{getStatusBadge(review.status)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {review.status !== 'approved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-200 text-green-700 hover:bg-green-50"
                        onClick={() => handleApprove(review.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {review.status !== 'rejected' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() => handleReject(review.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Product Reviews</h1>
        <p className="text-slate-500 mt-1.5">Manage customer reviews and moderate content</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-600">Pending Reviews</p>
              <MessageSquare className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-semibold text-slate-900">{pendingCount}</p>
            <p className="text-sm text-slate-500 mt-2">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-600">Approved Reviews</p>
              <Check className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-semibold text-slate-900">{approvedCount}</p>
            <p className="text-sm text-slate-500 mt-2">Live on website</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-600">Rejected Reviews</p>
              <X className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-3xl font-semibold text-slate-900">{rejectedCount}</p>
            <p className="text-sm text-slate-500 mt-2">Not displayed</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search by customer name, product, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="all">All Reviews ({reviews.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">All Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {renderReviewsTable(filteredReviews())}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">Pending Reviews</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Reviews awaiting approval</p>
            </CardHeader>
            <CardContent>
              {renderReviewsTable(filteredReviews('pending'))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">Approved Reviews</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Currently visible on the website</p>
            </CardHeader>
            <CardContent>
              {renderReviewsTable(filteredReviews('approved'))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">Rejected Reviews</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Reviews that won't be displayed</p>
            </CardHeader>
            <CardContent>
              {renderReviewsTable(filteredReviews('rejected'))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Details Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>
              View and moderate the review details.
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Review ID</p>
                  <p className="font-mono text-slate-900">{selectedReview.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Date</p>
                  <p className="text-slate-900">{formatDate(selectedReview.date)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-1">Product</p>
                <div className="flex items-center gap-3 mt-2">
                  <img 
                    src={getProductImage(selectedReview.productId)} 
                    alt={selectedReview.productName}
                    className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                  />
                  <p className="font-semibold text-slate-900">{selectedReview.productName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Customer</p>
                  <p className="text-slate-900">{selectedReview.customer}</p>
                  <p className="text-sm text-slate-500">{selectedReview.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Rating</p>
                  {renderStars(selectedReview.rating)}
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-2">Review Comment</p>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-slate-900">{selectedReview.comment}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-1">Status</p>
                {getStatusBadge(selectedReview.status)}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                {selectedReview.status !== 'approved' && (
                  <Button
                    onClick={() => {
                      handleApprove(selectedReview.id);
                      setShowDialog(false);
                    }}
                    className="bg-green-600 hover:bg-green-700 flex-1"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve Review
                  </Button>
                )}
                {selectedReview.status !== 'rejected' && (
                  <Button
                    onClick={() => {
                      handleReject(selectedReview.id);
                      setShowDialog(false);
                    }}
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50 flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject Review
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}