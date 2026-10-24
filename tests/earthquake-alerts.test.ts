import assert from "node:assert/strict";
import test from "node:test";
import {
  getSeenUSGSEventIds,
  getUnseenRecentUSGSDispatches,
  getUSGSAlertSeenStorageKey,
  hasDispatchForEventId,
  isRecentUSGSEvent,
  markUSGSDispatchesSeen,
  USGS_ALERT_MAX_AGE_MS,
  USGS_ALERT_SOURCE,
} from "../src/lib/earthquakeAlerts";

test("dispatch idempotency uses only the stable upstream event ID", () => {
  const dispatches = [
    { eventId: "usgs-event-1", location: "Afar", magnitude: 5.1 },
  ];

  assert.equal(hasDispatchForEventId(dispatches, "usgs-event-1"), true);
  assert.equal(hasDispatchForEventId(dispatches, "usgs-event-2"), false);
  assert.equal(
    hasDispatchForEventId(
      [{ eventId: "unrelated-id", location: "Afar", magnitude: 5.1 }],
      "usgs-event-1",
    ),
    false,
  );
});

test("only recent upstream events are eligible for automatic dispatch", () => {
  const now = Date.now();

  assert.equal(
    isRecentUSGSEvent({ id: "usgs-event-1", dateTime: new Date(now).toISOString() }, now),
    true,
  );
  assert.equal(
    isRecentUSGSEvent(
      {
        id: "usgs-event-1",
        dateTime: new Date(now - USGS_ALERT_MAX_AGE_MS - 1).toISOString(),
      },
      now,
    ),
    false,
  );
  assert.equal(isRecentUSGSEvent({ id: "mock_1", dateTime: "invalid" }, now), false);
  assert.equal(isRecentUSGSEvent({ dateTime: new Date(now).toISOString() }, now), false);
});

test("per-user persisted seen IDs suppress refresh replay but not other users", () => {
  const now = Date.now();
  const storage = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => storage.get(key) || null,
    setItem: (key: string, value: string) => storage.set(key, value),
  };
  const dispatch = {
    id: "dispatch-1",
    eventId: "usgs-event-1",
    source: USGS_ALERT_SOURCE,
    timestamp: new Date(now - 1000).toISOString(),
  };

  const firstUserSeen = getSeenUSGSEventIds(localStorage, "first@example.org", now);
  assert.deepEqual(getUnseenRecentUSGSDispatches([dispatch], firstUserSeen, now), [dispatch]);
  markUSGSDispatchesSeen(localStorage, "first@example.org", [dispatch], now);

  const refreshedUserSeen = getSeenUSGSEventIds(localStorage, "FIRST@example.org", now);
  assert.deepEqual(getUnseenRecentUSGSDispatches([dispatch], refreshedUserSeen, now), []);
  const otherUserSeen = getSeenUSGSEventIds(localStorage, "second@example.org", now);
  assert.deepEqual(getUnseenRecentUSGSDispatches([dispatch], otherUserSeen, now), [dispatch]);
  assert.notEqual(
    getUSGSAlertSeenStorageKey("first@example.org"),
    getUSGSAlertSeenStorageKey("second@example.org"),
  );
});

test("only recent real USGS dispatches qualify for a per-user notification", () => {
  const now = Date.now();
  const dispatch = {
    eventId: "usgs-event-1",
    source: USGS_ALERT_SOURCE,
    timestamp: new Date(now).toISOString(),
  };

  assert.deepEqual(getUnseenRecentUSGSDispatches([dispatch], new Set(), now), [dispatch]);
  assert.deepEqual(
    getUnseenRecentUSGSDispatches(
      [{ ...dispatch, timestamp: new Date(now - USGS_ALERT_MAX_AGE_MS - 1).toISOString() }],
      new Set(),
      now,
    ),
    [],
  );
  assert.deepEqual(
    getUnseenRecentUSGSDispatches(
      [{ ...dispatch, source: "Manual / API Trigger" }],
      new Set(),
      now,
    ),
    [],
  );
});
