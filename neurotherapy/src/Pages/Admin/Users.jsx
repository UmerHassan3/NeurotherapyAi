import {
  deleteContact,
  getContacts,
  sendReply,
} from "@/store/adminSlice/adminSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Trash2, Mail, Eye } from "lucide-react";

export default function ContactDashboard() {
  const { Contact = [], loading } = useSelector((state) => state.admin);
  const dispatch = useDispatch();

  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    dispatch(getContacts());
  }, [dispatch]);

  // ✅ DELETE CONTACT
  const handleDelete = async (id) => {
    const confirmDelete = confirm("Delete this message?");
    if (!confirmDelete) return;

    try {
      setDeletingId(id);

      const res = await dispatch(deleteContact(id)).unwrap();

      toast.success(res.message || "Deleted successfully 🗑️");
      dispatch(getContacts());

    } catch (error) {
      toast.error(error?.message || "Delete failed ❌");
    } finally {
      setDeletingId(null);
    }
  };

  // ✅ SEND REPLY
  const handleSendReply = async () => {
    if (!replyText.trim()) {
      return toast.error("Reply cannot be empty ❌");
    }

    try {
      setReplyLoading(true);

      const formData = {
        name: replyModal.name,
        email: replyModal.email,
        message: replyText,
      };

      const res = await dispatch(sendReply(formData)).unwrap();

      toast.success(res.message || "Reply sent successfully ✅");

      setReplyModal(null);
      setReplyText("");

    } catch (error) {
      toast.error(error?.message || "Failed to send reply ❌");
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 text-white">

      {/* HEADER */}
      <div className="flex justify-between flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-sm text-gray-400">
            Manage and respond to user messages
          </p>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
        {loading ? (
          <p className="p-5 text-gray-400">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-gray-400">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Message</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {Contact.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-6 text-gray-400">
                    No messages found
                  </td>
                </tr>
              ) : (
                Contact.map((c) => (
                  <tr
                    key={c._id}
                    className="border-t border-slate-700 hover:bg-slate-700/40 transition"
                  >
                    {/* NAME */}
                    <td className="p-3 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs">
                        {c.name?.[0]?.toUpperCase() || "U"}
                      </span>
                      {c.name}
                    </td>

                    {/* EMAIL */}
                    <td className="p-3 text-gray-400">{c.email}</td>

                    {/* MESSAGE */}
                    <td className="p-3 text-gray-300 max-w-[220px] truncate">
                      {c.message}
                    </td>

                    {/* ACTIONS */}
                    <td className="p-3 flex gap-2">

                      {/* VIEW */}
                      <button
                        onClick={() => setSelectedMsg(c)}
                        className="p-2 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-400"
                      >
                        <Eye size={16} />
                      </button>

                      {/* REPLY */}
                      <button
                        onClick={() => {
                          setReplyModal(c);
                          setReplyText("");
                        }}
                        className="p-2 rounded-md bg-green-500/10 hover:bg-green-500/20 text-green-400"
                      >
                        <Mail size={16} />
                      </button>

                      {/* DELETE */}
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="p-2 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400"
                      >
                        {deletingId === c._id ? "..." : <Trash2 size={16} />}
                      </button>

                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* VIEW MODAL */}
      {selectedMsg && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-6 rounded-xl max-w-lg w-full border border-slate-700">

            <h2 className="text-lg font-semibold mb-2">
              {selectedMsg.name}
            </h2>

            <p className="text-sm text-gray-400 mb-4">
              {selectedMsg.email}
            </p>

            <div className="bg-slate-800 p-4 rounded-md text-gray-300 text-sm mb-4">
              {selectedMsg.message}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedMsg(null)}
                className="px-4 py-2 bg-gray-600 rounded-md text-sm"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* REPLY MODAL */}
      {replyModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-6 rounded-xl max-w-lg w-full border border-slate-700">

            <h2 className="text-lg font-semibold mb-2">
              Reply to {replyModal.name}
            </h2>

            <p className="text-sm text-gray-400 mb-4">
              {replyModal.email}
            </p>

            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
              className="w-full h-32 p-3 rounded-md bg-slate-800 text-gray-300 border border-slate-700 focus:outline-none"
            />

            <div className="flex justify-end gap-3 mt-4">

              <button
                onClick={() => setReplyModal(null)}
                className="px-4 py-2 bg-gray-600 rounded-md text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleSendReply}
                disabled={replyLoading}
                className="px-4 py-2 bg-green-600 rounded-md text-sm disabled:opacity-50"
              >
                {replyLoading ? "Sending..." : "Send Reply"}
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}