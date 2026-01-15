import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { Globe, RefreshCw, ThumbsUp, ThumbsDown, MapPin, AlertCircle } from "lucide-react";

// Define the Comment Interface structure matching your Backend
interface Comment {
  _id: string;
  videoid: string;
  userid: string;
  commentbody: string;
  usercommented: string;
  userImage?: string; // Stores the Google Photo URL
  commentedon: string;
  city?: string;
  likes: string[];    // Array of User IDs/IPs
  dislikes: string[]; // Array of User IDs/IPs
}

// Language Options for Translation
const LANGUAGES = [
  "English", "Hindi", "Bengali", "Telugu", "Marathi", "Tamil", "Urdu", "Gujarati",
  "Kannada", "Malayalam", "Odia", "Punjabi", "Assamese", "Maithili", "Santali",
  "Kashmiri", "Nepali", "Konkani", "Sindhi", "Dogri", "Manipuri", "Bodo", "Sanskrit"
];

const Comments = ({ videoId }: any) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  const [validationError, setValidationError] = useState("");
  const [editValidationError, setEditValidationError] = useState("");

  const [inputLang, setInputLang] = useState("Hindi");
  const [commentLangMap, setCommentLangMap] = useState<Record<string, string>>({});
  const [translatedComments, setTranslatedComments] = useState<Record<string, string>>({});
  const [translatingIds, setTranslatingIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadComments();
  }, [videoId]);

  const loadComments = async () => {
    try {
      const res = await axiosInstance.get(`/comment/${videoId}`);
      setComments(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };


  const containsSpecialChars = (text: string) => {
    const safePattern = /^[\p{L}\p{M}\p{N}\s.,?!'"\-\u0964:;()]+$/u;

    return !safePattern.test(text);
  };


  const handleLike = async (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c._id === commentId) {
          const myId = user ? user._id : "temp-ip-user";

          const hasLiked = c.likes.includes(myId);
          const newLikes = hasLiked
            ? c.likes.filter((id) => id !== myId)
            : [...c.likes, myId];

          const newDislikes = c.dislikes.filter((id) => id !== myId);

          return { ...c, likes: newLikes, dislikes: newDislikes };
        }
        return c;
      })
    );

    try {
      await axiosInstance.patch(`/feedback/like/${commentId}`);
    } catch (error) {
      console.log("Like failed", error);
      loadComments();
    }
  };


  const handleDislike = async (commentId: string) => {
    const target = comments.find((c) => c._id === commentId);

    if (target && target.dislikes.length >= 2) {
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } else {
      setComments((prev) =>
        prev.map((c) => {
          if (c._id === commentId) {
            const myId = user ? user._id : "temp-ip-user";
            const hasDisliked = c.dislikes.includes(myId);

            const newDislikes = hasDisliked
              ? c.dislikes.filter((id) => id !== myId)
              : [...c.dislikes, myId];

            const newLikes = c.likes.filter((id) => id !== myId);

            return { ...c, likes: newLikes, dislikes: newDislikes };
          }
          return c;
        })
      );
    }

    try {
      await axiosInstance.patch(`/feedback/dislike/${commentId}`);
    } catch (error) {
      console.log("Dislike failed", error);
      loadComments();
    }
  };


  const handleTranslate = async (text: string, commentId?: string, isInput: boolean = false) => {
    if (!text.trim()) return;
    const targetLang = isInput ? inputLang : (commentLangMap[commentId!] || "Hindi");

    if (commentId) setTranslatingIds((prev) => ({ ...prev, [commentId]: true }));
    else if (isInput) setIsSubmitting(true);

    try {
      const res = await axiosInstance.post("/api/translate", {
        text: text,
        targetLanguage: targetLang,
      });

      if (res.data.translatedText) {
        if (isInput) {
          setNewComment(res.data.translatedText);
          setValidationError("");
        } else if (commentId) {
          setTranslatedComments((prev) => ({ ...prev, [commentId]: res.data.translatedText }));
        }
      }
    } catch (error) {
      console.error("Translation failed", error);
    } finally {
      if (commentId) setTranslatingIds((prev) => ({ ...prev, [commentId]: false }));
      else if (isInput) setIsSubmitting(false);
    }
  };

  const handleRevertTranslation = (commentId: string) => {
    const newTranslations = { ...translatedComments };
    delete newTranslations[commentId];
    setTranslatedComments(newTranslations);
  };

  const handleCommentLangChange = (commentId: string, lang: string) => {
    setCommentLangMap(prev => ({ ...prev, [commentId]: lang }));
  };

  const getUserCity = async (): Promise<string> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve("Unknown");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log(latitude, longitude);

          try {
            const res = await fetch(
              `https://api.weatherapi.com/v1/current.json?key=037c82dcda5b4a53a81193032252512&q=${latitude},${longitude}`
            );
            const data = await res.json();
            const city = data?.location?.name;
            console.log("User Region / State:", city);
            resolve(city);
          } catch {
            resolve("Unknown");
          }
        },
        () => resolve("Unknown"),
        { enableHighAccuracy: true }
      );
    });
  };


  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;


    if (containsSpecialChars(newComment)) {
      setValidationError("Special characters are not allowed. Please use only letters, numbers, and basic punctuation.");
      return;
    }
    setValidationError("");

    setIsSubmitting(true);

    try {
      const detectedCity = await getUserCity();


      const res = await axiosInstance.post("/comment/postcomment", {
        videoid: videoId,
        userid: user._id,
        commentbody: newComment,
        usercommented: user.name,
        userImage: user.image,
        city: detectedCity,
      });

      if (res.data.comment) {
        const newCommentObj: Comment = {
          _id: Date.now().toString(),
          videoid: videoId,
          userid: user._id,
          commentbody: newComment,
          usercommented: user.name || "Anonymous",
          userImage: user.image,
          commentedon: new Date().toISOString(),
          city: res.data.city,
          likes: [],
          dislikes: []
        };
        setComments([newCommentObj, ...comments]);
        loadComments();
      }
      setNewComment("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/comment/deletecomment/${id}`);
      setComments((prev) => prev.filter((c) => c._id !== id));
    } catch (error) { console.log(error); }
  };

  const handleEdit = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.commentbody);
    setEditValidationError("");
  };


  const handleUpdateComment = async () => {
    if (!editText.trim()) return;
    if (containsSpecialChars(editText)) {
      setEditValidationError("Symbols (@#$%) are not allowed.");
      return;
    }

    try {
      await axiosInstance.patch(`/comment/editcomment/${editingCommentId}`, { commentbody: editText });


      setComments((prev) => prev.map((c) => c._id === editingCommentId ? { ...c, commentbody: editText } : c));

      setEditingCommentId(null);
      setEditValidationError("");
    } catch (error) {
      console.error("Save failed", error);
      setEditValidationError("Failed to save. Please try again.");
    }
  };

  if (loading) return <div>Loading comments...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{comments.length} Comments</h2>

      {user && (
        <div className="flex gap-4">
          <Avatar className="w-10 h-10">

            <AvatarImage src={user.image || ""} />
            <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder={`Write a comment... (Translate to ${inputLang} available)`}
              value={newComment}
              onChange={(e: any) => {
                setNewComment(e.target.value);
                if (validationError) setValidationError("");
              }}
              className={`min-h-[80px] resize-none border-0 border-b-2 rounded-none focus-visible:ring-0 ${validationError ? "border-red-500" : ""}`}
            />


            {validationError && (
              <div className="flex items-center gap-2 text-red-500 text-xs animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-3 h-3" />
                {validationError}
              </div>
            )}

            <div className="flex gap-2 justify-end items-center">
              <select
                className="text-xs border rounded px-2 py-1 bg-gray-50 dark:bg-gray-800"
                value={inputLang}
                onChange={(e) => setInputLang(e.target.value)}
              >
                {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTranslate(newComment, undefined, true)}
                disabled={!newComment.trim() || isSubmitting}
              >
                Translate Input
              </Button>
              <Button onClick={handleSubmitComment} disabled={!newComment.trim() || isSubmitting}>
                Comment
              </Button>
            </div>
          </div>
        </div>
      )}


      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment._id} className="flex gap-4">
            <Avatar className="w-10 h-10">

              <AvatarImage src={comment.userImage || ""} />
              <AvatarFallback>{comment.usercommented[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">


              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-medium text-sm">{comment.usercommented}</span>
                <span className="text-xs text-gray-500 flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                  <MapPin className="w-3 h-3" /> {comment.city || "Unknown"}
                </span>
                <span className="text-xs text-gray-600">
                  • {formatDistanceToNow(new Date(comment.commentedon))} ago
                </span>
              </div>


              {editingCommentId === comment._id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editText}
                    onChange={(e) => {
                      setEditText(e.target.value);
                      if (editValidationError) setEditValidationError("");
                    }}
                    className={editValidationError ? "border-red-500" : ""}
                  />
                  {editValidationError && (
                    <p className="text-red-500 text-xs">{editValidationError}</p>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button onClick={handleUpdateComment}>Save</Button>
                    <Button variant="ghost" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>

                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {translatedComments[comment._id] || comment.commentbody}
                  </p>


                  {translatedComments[comment._id] && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-blue-600">
                        Translated to {commentLangMap[comment._id] || "Hindi"}
                      </span>
                      <button
                        onClick={() => handleRevertTranslation(comment._id)}
                        className="text-xs text-gray-500 underline"
                      >
                        Original
                      </button>
                    </div>
                  )}


                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 items-center">

                    <button
                      onClick={() => handleLike(comment._id)}
                      className={`flex items-center gap-1 hover:text-blue-500 transition-colors ${user && comment.likes.includes(user._id) ? "text-blue-600 font-bold" : ""}`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${user && comment.likes.includes(user._id) ? "fill-blue-600" : ""}`} />
                      <span>{comment.likes.length > 0 ? comment.likes.length : 0}</span>
                    </button>


                    <button
                      onClick={() => handleDislike(comment._id)}
                      className={`flex items-center gap-1 hover:text-red-500 transition-colors ${user && comment.dislikes.includes(user._id) ? "text-red-600 font-bold" : ""}`}
                    >
                      <ThumbsDown className={`w-4 h-4 ${user && comment.dislikes.includes(user._id) ? "fill-red-600" : ""}`} />
                      <span>{comment.dislikes.length > 0 ? comment.dislikes.length : 0}</span>
                    </button>

                    <span className="text-gray-300">|</span>


                    <div className="flex items-center gap-1 border rounded-md p-1 bg-gray-50 dark:bg-gray-900">
                      <select
                        className="text-xs bg-transparent border-none focus:ring-0 cursor-pointer w-20 outline-none"
                        value={commentLangMap[comment._id] || "Hindi"}
                        onChange={(e) => handleCommentLangChange(comment._id, e.target.value)}
                      >
                        {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                      </select>
                      <button
                        onClick={() => handleTranslate(comment.commentbody, comment._id)}
                        disabled={translatingIds[comment._id]}
                        className="px-2 py-0.5 text-xs bg-white dark:bg-gray-800 border rounded shadow-sm hover:bg-gray-100 flex items-center gap-1"
                      >
                        {translatingIds[comment._id] ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
                        Translate
                      </button>
                    </div>

                    {comment.userid === user?._id && (
                      <>
                        <button onClick={() => handleEdit(comment)} className="hover:text-gray-900 text-xs ml-2">Edit</button>
                        <button onClick={() => handleDelete(comment._id)} className="hover:text-red-500 text-xs">Delete</button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments;