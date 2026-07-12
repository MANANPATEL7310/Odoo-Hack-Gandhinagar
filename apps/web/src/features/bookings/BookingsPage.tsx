import { useEffect, useState } from "react";
import {
  getBookingsRepository,
  getAssetsRepository,
} from "@/services/data/repositories";
import type { Booking, Asset, Employee } from "@/services/data/types/domain";
import { getOrgRepository } from "@/services/data/repositories";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Plus } from "lucide-react";
import { BookingFormDialog } from "./BookingFormDialog";

export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [bookingsData, assetsData, employeesData] = await Promise.all([
          getBookingsRepository().listBookings(),
          getAssetsRepository().listAssets(),
          getOrgRepository().listEmployees(),
        ]);
        setBookings(bookingsData);
        setAssets(assetsData);
        setEmployees(employeesData);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const refreshData = async () => {
    const data = await getBookingsRepository().listBookings();
    setBookings(data);
  };

  const bookableAssets = assets.filter((a) => a.isBookable);

  return (
    <div className="space-y-6 p-2 lg:p-0">
      <BookingFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        assets={bookableAssets}
        onSubmit={async (payload) => {
          try {
            await getBookingsRepository().createBooking(payload);
            await refreshData();
          } catch (e) {
            console.error("Failed to submit booking", e);
          }
        }}
      />

      <div className="flex items-end justify-between">
        <div>
          <h1 className="page-title">Bookings</h1>
          <p className="page-copy mt-2">
            Manage short-term reservations for shared equipment like projectors,
            vehicles, or cameras.
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="shadow-lg shadow-primary/20"
        >
          <Plus className="mr-2 size-4" />
          New Booking
        </Button>
      </div>

      <div className="surface-card p-6">
        <div className="rounded-lg border border-white/20">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Booked By</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((b) => {
                const assetName =
                  b.resourceAsset?.name ||
                  assets.find((asset) => asset.id === b.resourceAssetId)
                    ?.name ||
                  "Unknown";
                const userName =
                  b.bookedBy?.name ||
                  employees.find(
                    (employee) => employee.id === b.bookedByEmployeeId,
                  )?.name ||
                  "Unknown";

                let badgeVariant:
                  | "default"
                  | "success"
                  | "secondary"
                  | "danger" = "default";
                if (b.status === "UPCOMING") badgeVariant = "default";
                if (b.status === "ONGOING") badgeVariant = "success";
                if (b.status === "COMPLETED") badgeVariant = "secondary";
                if (b.status === "CANCELLED") badgeVariant = "danger";

                return (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{assetName}</TableCell>
                    <TableCell>{userName}</TableCell>
                    <TableCell>
                      {new Date(b.startTime).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {new Date(b.endTime).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={badgeVariant}>{b.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {b.status === "UPCOMING" && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:bg-danger/10 hover:text-danger"
                            onClick={async () => {
                              try {
                                await getBookingsRepository().cancelBooking(
                                  b.id,
                                );
                                await refreshData();
                              } catch (e) {
                                console.error("Failed to cancel", e);
                              }
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="bg-primary text-white hover:bg-primary/90"
                            onClick={async () => {
                              try {
                                await getBookingsRepository().markBookingOngoing(
                                  b.id,
                                );
                                await refreshData();
                              } catch (e) {
                                console.error("Failed to start", e);
                              }
                            }}
                          >
                            Start
                          </Button>
                        </div>
                      )}
                      {b.status === "ONGOING" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              await getBookingsRepository().markBookingCompleted(
                                b.id,
                              );
                              await refreshData();
                            } catch (e) {
                              console.error("Failed to end", e);
                            }
                          }}
                        >
                          End Booking
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
