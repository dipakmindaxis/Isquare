import React, { useState, useEffect } from "react";
import { X, Paperclip, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { createTaskAttachment } from "../Services/TaskAttachmentService";
import { getAllTasks } from "../../../SalesActivities/Services/TaskService";
import type { TaskItem } from "../../../SalesActivities/Types/TaskTypes";

interface UploadTaskAttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultTaskId?: number;
}

export const UploadTaskAttachmentModal: React.FC<
  UploadTaskAttachmentModalProps
> = ({ isOpen, onClose, onSuccess, defaultTaskId }) => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | string>(
    defaultTaskId || ""
  );
  const [documentName, setDocumentName] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      if (defaultTaskId) {
        setSelectedTaskId(defaultTaskId);
      } else {
        setSelectedTaskId("");
      }
      setDocumentName("");
      setSelectedFile(null);
      setIsActive(true);

      getAllTasks()
        .then((data) => setTasks(Array.isArray(data) ? data : []))
        .catch(() => setTasks([]));
    }
  }, [isOpen, defaultTaskId]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!documentName.trim()) {
        const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
        setDocumentName(baseName);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tId = Number(selectedTaskId);
    if (!tId || tId <= 0) {
      toast.error("Please select a task.");
      return;
    }
    if (!documentName.trim()) {
      toast.error("Document Name is required.");
      return;
    }
    if (!selectedFile) {
      toast.error("Please select a file to attach.");
      return;
    }

    setIsLoading(true);
    try {
      await createTaskAttachment({
        taskId: tId,
        documentName: documentName.trim(),
        file: selectedFile,
        isActive,
      });
      toast.success("Task attachment uploaded successfully!");
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to upload task attachment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 text-[#FF7900] border border-[#FF7900]/20 rounded-xl flex items-center justify-center">
              <Paperclip className="w-5 h-5 text-[#FF7900]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Upload Task Attachment
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Task Select */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Select Task <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900] transition bg-white"
            >
              <option value="">-- Choose a Task --</option>
              {tasks.map((t) => (
                <option key={t.taskId} value={t.taskId}>
                  #{t.taskId} - {t.taskTitle} {t.companyName ? `(${t.companyName})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Document Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Document / Attachment Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="e.g. Safety Inspection Checklist, Spec Sheet"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7900]/20 focus:border-[#FF7900] transition"
            />
          </div>

          {/* File Picker */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Select File <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-200 hover:border-[#FF7900] rounded-xl p-4 text-center transition cursor-pointer relative bg-slate-50/50">
              <input
                type="file"
                onChange={handleFileChange}
                required={!selectedFile}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center gap-1.5">
                <Upload size={22} className="text-[#FF7900]" />
                {selectedFile ? (
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-800 break-words max-w-xs">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-gray-700">
                      Click to choose or drag & drop file
                    </p>
                    <p className="text-xs text-gray-400">
                      PDF, DOCX, XLSX, PNG, JPG (up to 25MB)
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Active Checkbox */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="attachmentActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-[#FF7900] border-gray-300 rounded focus:ring-[#FF7900]"
            />
            <label
              htmlFor="attachmentActive"
              className="text-sm font-semibold text-gray-700 cursor-pointer"
            >
              Active
            </label>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-[#FF7900] hover:bg-[#e06800] text-white text-sm font-semibold shadow-sm transition inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload Attachment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default UploadTaskAttachmentModal;
