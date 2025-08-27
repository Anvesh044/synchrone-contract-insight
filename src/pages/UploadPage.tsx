import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { ProgressBar } from "@/components/ProgressBar";
import { useContracts } from "@/contexts/ContractContext";
import { Contract } from "@/data/mockContracts";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UploadedFile {
  file: File;
  status: "uploading" | "processing" | "completed" | "error";
  progress: number;
  extractedText?: string;
  error?: string;
}

export const UploadPage = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const { addContract } = useContracts();

  const simulateProcessing = useCallback((fileIndex: number) => {
    const updateProgress = (progress: number) => {
      setUploadedFiles(prev => 
        prev.map((f, i) => 
          i === fileIndex 
            ? { ...f, progress, status: progress < 100 ? "processing" : "completed" as const }
            : f
        )
      );
    };

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        // Simulate processing completion
        setTimeout(() => {
          setUploadedFiles(prev => 
            prev.map((f, i) => 
              i === fileIndex 
                ? { 
                    ...f, 
                    status: "completed",
                    extractedText: "Contract successfully processed. Key terms extracted including parties, dates, financial obligations, and payment terms. AI analysis completed with 95% confidence score."
                  }
                : f
            )
          );
          
          // Add the completed contract to the contracts list
          setUploadedFiles(currentFiles => {
            const file = currentFiles[fileIndex]?.file;
            if (file) {
            const newContract: Contract = {
              id: Date.now().toString(),
              title: file.name.replace('.pdf', ''),
              parties: ["Your Company", "Contract Party"],
              status: "completed",
              confidenceScore: 95,
              uploadDate: new Date().toISOString().split('T')[0],
              financialValue: "$" + (Math.floor(Math.random() * 900000) + 100000).toLocaleString(),
              extractedData: {
                contractType: "Service Agreement",
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                paymentTerms: "Net 30 days",
                slaDetails: "Standard service level agreement",
                keyObligations: [
                  "Provide agreed services",
                  "Maintain quality standards",
                  "Meet delivery timelines"
                ],
                riskFactors: [
                  "Payment terms",
                  "Service level requirements"
                ]
              }
            };
              addContract(newContract);
              toast.success("Contract processed and added to your list!");
            }
            return currentFiles;
          });
        }, 1000);
      }
      updateProgress(Math.min(progress, 100));
    }, 200);
  }, []);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files).map(file => ({
      file,
      status: "uploading" as const,
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Start processing each file
    newFiles.forEach((_, index) => {
      const fileIndex = uploadedFiles.length + index;
      simulateProcessing(fileIndex);
    });
  }, [uploadedFiles.length, simulateProcessing]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const removeFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Upload Contracts</h1>
          <p className="text-muted-foreground">
            Upload PDF contracts to extract key information and analyze terms using AI
          </p>
        </div>

        {/* Upload Area */}
        <Card className="gradient-card">
          <CardContent className="p-0">
            <div
              className={cn(
                "upload-zone",
                dragOver && "drag-over"
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Drop your contracts here</h3>
                  <p className="text-muted-foreground">or click to browse files</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  className="hidden"
                  id="file-upload"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
                <Button asChild className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Select Files
                  </label>
                </Button>
                <p className="text-xs text-muted-foreground">
                  Supports PDF files up to 10MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Processing Files</h2>
            <div className="space-y-4">
              {uploadedFiles.map((uploadedFile, index) => (
                <Card key={index} className="gradient-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">{uploadedFile.file.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {uploadedFile.status === "completed" && (
                        <CheckCircle className="h-5 w-5 text-success" />
                      )}
                      {uploadedFile.status === "error" && (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(uploadedFile.status === "uploading" || uploadedFile.status === "processing") && (
                      <ProgressBar 
                        progress={uploadedFile.progress} 
                        showPercentage
                      />
                    )}
                    
                    <div className="text-sm text-muted-foreground">
                      Size: {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </div>

                    {uploadedFile.extractedText && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">Extraction Summary</h4>
                        <p className="text-sm text-muted-foreground">
                          {uploadedFile.extractedText}
                        </p>
                      </div>
                    )}

                    {uploadedFile.error && (
                      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <h4 className="font-medium text-destructive mb-2">Error</h4>
                        <p className="text-sm text-destructive/80">
                          {uploadedFile.error}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};