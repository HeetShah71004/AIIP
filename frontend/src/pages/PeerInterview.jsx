import React, { useEffect, useMemo, useState } from 'react';
import { Users, CalendarClock, WandSparkles, Video, RefreshCw, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  autoMatchPeer,
  bookPeerSession,
  cancelPeerSession,
  createPeerAvailability,
  getUpcomingPeerSessions,
  reschedulePeerSession,
  searchPeerAvailability
} from '@/api/interviewApi';

const roleOptions = ['Frontend Engineer', 'Backend Engineer', 'Fullstack Engineer', 'Data Engineer'];
const levelOptions = ['Intern', 'Junior', 'Mid', 'Senior'];

const toDatetimeLocal = (isoDate) => {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

const formatDateTime = (value, timezone) => {
  if (!value) return 'NA';
  try {
    return new Date(value).toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: timezone || undefined
    });
  } catch {
    return new Date(value).toLocaleString();
  }
};

const PeerInterview = () => {
  const [availability, setAvailability] = useState({
    role: roleOptions[2],
    level: levelOptions[2],
    topic: 'System design fundamentals',
    startAt: '',
    durationMinutes: 45,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  });

  const [filters, setFilters] = useState({
    role: roleOptions[2],
    level: levelOptions[2],
    topic: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  });

  const [slots, setSlots] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);
  const [submittingAvailability, setSubmittingAvailability] = useState(false);
  const [rescheduleDraft, setRescheduleDraft] = useState({});

  const canCreateAvailability = useMemo(() => {
    return availability.role && availability.level && availability.startAt;
  }, [availability]);

  const loadUpcoming = async () => {
    setLoadingUpcoming(true);
    try {
      const response = await getUpcomingPeerSessions();
      setUpcoming(response?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load upcoming peer sessions.');
    } finally {
      setLoadingUpcoming(false);
    }
  };

  useEffect(() => {
    loadUpcoming();
  }, []);

  const onCreateAvailability = async () => {
    if (!canCreateAvailability) {
      toast.error('Role, level and start time are required.');
      return;
    }

    const startDate = new Date(availability.startAt);
    if (startDate <= new Date()) {
      toast.error('Please pick a future time slot.');
      return;
    }

    setSubmittingAvailability(true);
    try {
      await createPeerAvailability({
        ...availability,
        startAt: new Date(availability.startAt).toISOString()
      });
      toast.success('Availability slot created.');
      await loadUpcoming();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create availability.');
    } finally {
      setSubmittingAvailability(false);
    }
  };

  const onSearch = async () => {
    setLoadingSearch(true);
    try {
      const response = await searchPeerAvailability(filters);
      setSlots(response?.data || []);
      if (!response?.data?.length) {
        toast('No open slots found for current filters.');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to search peer slots.');
    } finally {
      setLoadingSearch(false);
    }
  };

  const onAutoMatch = async () => {
    setLoadingSearch(true);
    try {
      const response = await autoMatchPeer(filters);
      if (response?.data) {
        setSlots([response.data]);
        toast.success('Best match found.');
      } else {
        setSlots([]);
        toast('No auto-match available right now.');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Auto-match failed.');
    } finally {
      setLoadingSearch(false);
    }
  };

  const onBook = async (sessionId) => {
    try {
      await bookPeerSession(sessionId);
      toast.success('Peer session booked.');
      await Promise.all([onSearch(), loadUpcoming()]);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not book this slot.');
    }
  };

  const onReschedule = async (sessionId) => {
    const nextTime = rescheduleDraft[sessionId];
    if (!nextTime) {
      toast.error('Please choose a new date and time.');
      return;
    }

    try {
      await reschedulePeerSession(sessionId, {
        startAt: new Date(nextTime).toISOString()
      });
      toast.success('Session rescheduled.');
      await loadUpcoming();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to reschedule session.');
    }
  };

  const onCancel = async (sessionId) => {
    try {
      await cancelPeerSession(sessionId);
      toast.success('Session cancelled.');
      await loadUpcoming();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to cancel session.');
    }
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 space-y-6 font-['Outfit']">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Peer Interview Scheduling</h1>
        <p className="text-muted-foreground">Set your availability, find a peer by role/level, and book interview practice sessions.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-1 border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarClock size={18} /> Publish Availability</CardTitle>
            <CardDescription>Create an open slot for another candidate to book.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="text-sm font-medium">Role</label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={availability.role}
              onChange={(e) => setAvailability((prev) => ({ ...prev, role: e.target.value }))}
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>

            <label className="text-sm font-medium">Level</label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={availability.level}
              onChange={(e) => setAvailability((prev) => ({ ...prev, level: e.target.value }))}
            >
              {levelOptions.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>

            <label className="text-sm font-medium">Topic</label>
            <Input
              value={availability.topic}
              onChange={(e) => setAvailability((prev) => ({ ...prev, topic: e.target.value }))}
              placeholder="System design, React architecture, DSA"
            />

            <label className="text-sm font-medium">Start Time</label>
            <Input
              type="datetime-local"
              value={availability.startAt}
              onChange={(e) => setAvailability((prev) => ({ ...prev, startAt: e.target.value }))}
            />

            <label className="text-sm font-medium">Duration (minutes)</label>
            <Input
              type="number"
              min={15}
              max={180}
              value={availability.durationMinutes}
              onChange={(e) => setAvailability((prev) => ({ ...prev, durationMinutes: Number(e.target.value) || 45 }))}
            />

            <label className="text-sm font-medium">Timezone</label>
            <Input
              value={availability.timezone}
              onChange={(e) => setAvailability((prev) => ({ ...prev, timezone: e.target.value }))}
              placeholder="Asia/Kolkata"
            />

            <Button className="w-full" disabled={submittingAvailability} onClick={onCreateAvailability}>
              {submittingAvailability ? 'Publishing...' : 'Publish Slot'}
            </Button>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2 border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users size={18} /> Find and Book Peer</CardTitle>
            <CardDescription>Search open slots with filters, or use auto-match for best candidate.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={filters.role}
                onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>

              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={filters.level}
                onChange={(e) => setFilters((prev) => ({ ...prev, level: e.target.value }))}
              >
                {levelOptions.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>

              <Input
                placeholder="Topic"
                value={filters.topic}
                onChange={(e) => setFilters((prev) => ({ ...prev, topic: e.target.value }))}
              />

              <Input
                placeholder="Timezone"
                value={filters.timezone}
                onChange={(e) => setFilters((prev) => ({ ...prev, timezone: e.target.value }))}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={onSearch} disabled={loadingSearch}>
                <RefreshCw size={16} className="mr-1" /> {loadingSearch ? 'Searching...' : 'Search Slots'}
              </Button>
              <Button onClick={onAutoMatch} disabled={loadingSearch}>
                <WandSparkles size={16} className="mr-1" /> Auto-Match
              </Button>
            </div>

            <div className="space-y-3">
              {slots.length === 0 && (
                <p className="text-sm text-muted-foreground">No slots loaded yet. Search or auto-match to view candidates.</p>
              )}
              {slots.map((slot) => (
                <div key={slot._id} className="rounded-lg border border-border/70 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold">{slot.peerInterview?.role} - {slot.peerInterview?.level}</p>
                    <p className="text-sm text-muted-foreground">Host: {slot.peerInterview?.hostUser?.name || 'Unknown user'}</p>
                    <p className="text-sm text-muted-foreground">Topic: {slot.peerInterview?.topic || 'General interview practice'}</p>
                    <p className="text-sm text-muted-foreground">{formatDateTime(slot.peerInterview?.startAt, slot.peerInterview?.timezone)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-primary">Match {slot.matchScore || 0}</span>
                    <Button onClick={() => onBook(slot._id)}>Book Slot</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Video size={18} /> Upcoming Peer Sessions</CardTitle>
          <CardDescription>Manage booked/open sessions, reschedule, or cancel when needed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingUpcoming && <p className="text-sm text-muted-foreground">Loading sessions...</p>}
          {!loadingUpcoming && upcoming.length === 0 && (
            <p className="text-sm text-muted-foreground">No upcoming peer sessions found.</p>
          )}

          {upcoming.map((session) => (
            <div key={session._id} className="rounded-lg border border-border/70 p-4 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <p className="font-semibold">{session.peerInterview?.role} - {session.peerInterview?.level}</p>
                  <p className="text-sm text-muted-foreground">Status: {session.status}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(session.peerInterview?.startAt, session.peerInterview?.timezone)}
                  </p>
                  {session.peerInterview?.meetingJoinUrl && (
                    <a className="text-sm text-primary underline" href={session.peerInterview.meetingJoinUrl} target="_blank" rel="noreferrer">Join meeting link</a>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => onReschedule(session._id)}>
                    <RefreshCw size={14} className="mr-1" /> Reschedule
                  </Button>
                  <Button variant="destructive" onClick={() => onCancel(session._id)}>
                    <Trash2 size={14} className="mr-1" /> Cancel
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  type="datetime-local"
                  value={rescheduleDraft[session._id] ?? toDatetimeLocal(session.peerInterview?.startAt)}
                  onChange={(e) => setRescheduleDraft((prev) => ({ ...prev, [session._id]: e.target.value }))}
                />
                <Input value={session.peerInterview?.timezone || ''} disabled />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default PeerInterview;
