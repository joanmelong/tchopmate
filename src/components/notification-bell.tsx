"use client"

import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotifications } from "@/hooks/use-notifications"

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffMins < 1440) return `Il y a ${Math.floor(diffMins / 60)}h`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-orange-500 text-white text-xs animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-orange-600 hover:text-orange-700"
              >
                Tout marquer comme lu
              </Button>
            )}
          </SheetTitle>
          <SheetDescription>
            {unreadCount > 0 
              ? `Vous avez ${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
              : 'Aucune nouvelle notification'
            }
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-150px)] mt-6">
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune notification</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                    notif.lu 
                      ? 'bg-white border-gray-200' 
                      : 'bg-orange-50 border-orange-200 hover:bg-orange-100'
                  }`}
                  onClick={() => !notif.lu && markAsRead(notif.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm">{notif.titre}</h4>
                    {!notif.lu && (
                      <div className="h-2 w-2 rounded-full bg-orange-500 flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                  <span className="text-xs text-gray-400">
                    {formatDate(notif.dateEnvoi)}
                  </span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}