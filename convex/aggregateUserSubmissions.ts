export interface AggregateSubmissionsOptions {
  submissions: any[];
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Aggregates multiple submissions from the same user into a single entry
 * - Combines totals from all submissions
 * - Deduplicates daily breakdowns by date (keeps data from latest submission time)
 * - Preserves first submission's _id for compatibility
 */
export function aggregateSubmissionsByUser(options: AggregateSubmissionsOptions) {
  const { submissions, dateFrom, dateTo } = options;

  // Sort submissions by submittedAt to ensure we process them in chronological order
  const sortedSubmissions = [...submissions].sort((a, b) => a.submittedAt - b.submittedAt);

  // Aggregate submissions by username
  const userAggregates = new Map<string, any>();

  for (const submission of sortedSubmissions) {
    const username = submission.username;

    // If date range is provided, filter the daily breakdown
    let relevantDays = submission.dailyBreakdown;
    if (dateFrom && dateTo) {
      relevantDays = submission.dailyBreakdown.filter((day: any) => {
        return day.date >= dateFrom && day.date <= dateTo;
      });

      // Skip this submission if no data in date range
      if (relevantDays.length === 0) continue;
    }

    // Calculate totals for the relevant days
    const totals = relevantDays.reduce(
      (acc: any, day: any) => ({
        totalCost: acc.totalCost + day.totalCost,
        totalTokens: acc.totalTokens + day.totalTokens,
        inputTokens: acc.inputTokens + day.inputTokens,
        outputTokens: acc.outputTokens + day.outputTokens,
        cacheCreationTokens: acc.cacheCreationTokens + day.cacheCreationTokens,
        cacheReadTokens: acc.cacheReadTokens + day.cacheReadTokens,
      }),
      {
        totalCost: 0,
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        cacheCreationTokens: 0,
        cacheReadTokens: 0,
      }
    );

    if (!userAggregates.has(username)) {
      // First submission for this user - use it as base, keep the first submission's _id for compatibility
      userAggregates.set(username, {
        ...submission,
        ...totals, 
        dailyBreakdown: relevantDays,
        // Track all submission IDs for this user
        submissionIds: [submission._id],
        submissionCount: 1,
        // Store original first submission ID
        originalId: submission._id,
      });
    } else {
      // Merge with existing user data
      const existing = userAggregates.get(username);

      // Keep the first submission's _id for compatibility
      const preservedId = existing._id;

      // Aggregate totals
      existing.totalCost += totals.totalCost;
      existing.totalTokens += totals.totalTokens;
      existing.inputTokens += totals.inputTokens;
      existing.outputTokens += totals.outputTokens;
      existing.cacheCreationTokens += totals.cacheCreationTokens;
      existing.cacheReadTokens += totals.cacheReadTokens;

      // Merge daily breakdowns - deduplicate by date
      const dailyMap = new Map();

      // Add all existing daily data first
      for (const day of existing.dailyBreakdown) {
        dailyMap.set(day.date, day);
      }

      // Add/update with new submission's daily data
      for (const day of relevantDays) {
        dailyMap.set(day.date, day);
      }

      // Convert back to sorted array
      existing.dailyBreakdown = Array.from(dailyMap.values())
        .sort((a: any, b: any) => a.date.localeCompare(b.date));

      // Update date range based on the aggregated data
      if (existing.dailyBreakdown.length > 0) {
        // Already sorted above, no need to sort again
        existing.dateRange = {
          start: existing.dailyBreakdown[0].date,
          end: existing.dailyBreakdown[existing.dailyBreakdown.length - 1].date,
        };
      }

      // Merge models used (from all daily data)
      const allModels = new Set<string>();
      for (const day of existing.dailyBreakdown) {
        if (day.modelsUsed) {
          day.modelsUsed.forEach((model: string) => allModels.add(model));
        }
      }
      existing.modelsUsed = Array.from(allModels);

      // Update GitHub info from most recent submission if available
      // Check BEFORE updating submittedAt
      if (submission.submittedAt > existing.submittedAt) {
        // Update submission time
        existing.submittedAt = submission.submittedAt;

        // Use GitHub info from most recent submission if available
        if (submission.githubUsername) {
          existing.githubUsername = submission.githubUsername;
        }
        if (submission.githubName) {
          existing.githubName = submission.githubName;
        }
        if (submission.githubAvatar) {
          existing.githubAvatar = submission.githubAvatar;
        }
      }

      // Use verified status if any submission is verified
      existing.verified = existing.verified || submission.verified;

      // Track submission info
      existing.submissionIds.push(submission._id);
      existing.submissionCount += 1;

      // Restore the preserved first submission's _id
      existing._id = preservedId;
    }
  }

  // Convert to array
  return Array.from(userAggregates.values());
}
