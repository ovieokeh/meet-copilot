import { TranscriptionResult } from "~/types";

export interface TranscriptionJob {
  id: string;
  promise: Promise<TranscriptionResult>;
  timestamp: string;
  sender: string;
}

export class TranscriptionQueue {
  private jobs: TranscriptionJob[] = [];
  private results: (TranscriptionResult | undefined)[] = [];
  private onSpeechReceived: (transcript: string, sender: string) => void;

  constructor(onSpeechReceived: (transcript: string, sender: string) => void) {
    this.onSpeechReceived = onSpeechReceived;
  }

  addJob = (job: TranscriptionJob) => {
    const index = this.jobs.length;
    this.jobs.push(job);
    this.results[index] = undefined; // Prepare the results array to maintain order

    // Wrap the job promise to handle its resolution
    job.promise
      .then((result) => {
        this.results[index] = result;
        this.triggerProcessing();
      })
      .catch((error) => {
        console.error(`Failed to process job ${job.id}:`, error);
        this.results[index] = { ...job, status: "failed" };
        this.triggerProcessing();
      });

    this.triggerProcessing();
  };

  private triggerProcessing = () => {
    this.processResults();
  };

  private processResults = () => {
    if (!this.results.length || this.results.every((result) => !result)) {
      console.info("No results to process");
      return;
    }

    // sort the results by timestamp
    this.results.sort((a, b) => {
      if (!a || !b) return 0;
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    let index = 0;
    while (index < this.results.length) {
      const result = this.results[index];
      if (result !== undefined) {
        if (result.status === "completed" && result.transcript) {
          this.onSpeechReceived(result.transcript, result.sender);
        }
        this.results.splice(index, 1);
      } else {
        index++;
      }
    }
  };
}
