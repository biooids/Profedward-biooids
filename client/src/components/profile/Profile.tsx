//./src/components/profile/Profile.tsx

"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  useGetMeQuery,
  useUpdateMyProfileMutation,
  useDeleteMyAccountMutation,
} from "@/lib/user/userApiSlice";
import {
  updateProfileSchema,
  UpdateProfileFormValues,
} from "@/lib/schemas/auth.schemas";
import { resetUploadState } from "@/lib/upload/uploadProgressSlice";
import {
  Loader2,
  Trash2,
  Camera,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Info,
  LogOut,
  Mail,
  User as UserIcon,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useFocusOnError } from "@/lib/hooks/useFocusOnError";
import Link from "next/link";

const ProfilePage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    data: session,
    status: sessionStatus,
    update: updateNextAuthSession,
  } = useSession();

  const {
    data: userProfile,
    isLoading: isFetchingProfile,
    isError: isProfileError,
  } = useGetMeQuery(undefined, {
    skip: sessionStatus !== "authenticated",
  });

  const [updateMyProfile, { isLoading: isUpdatingProfile }] =
    useUpdateMyProfileMutation();
  const [deleteMyAccount, { isLoading: isDeletingAccount }] =
    useDeleteMyAccountMutation();

  const uploadState = useAppSelector((state) => state.uploadProgress);

  const [uiMessage, setUiMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
    setFocus,
    watch,
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
  });

  const watchedFormFields = watch();

  const watchedFieldsString = useMemo(
    () => JSON.stringify(watchedFormFields),
    [watchedFormFields]
  );

  useEffect(() => {
    if (isDirty) {
      setUiMessage(null);
    }
  }, [watchedFieldsString, isDirty]);

  const profileImageUrl = userProfile?.profileImage;

  useEffect(() => {
    setImagePreview((currentPreview) => {
      if (currentPreview && currentPreview.startsWith("blob:")) {
        return currentPreview;
      }
      return profileImageUrl || null;
    });
  }, [profileImageUrl]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;

    dispatch(resetUploadState());
    setUiMessage(null);
    const temporaryPreview = URL.createObjectURL(file);
    setImagePreview(temporaryPreview);

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const response = await updateMyProfile(formData).unwrap();
      setUiMessage({ type: "success", text: "Profile picture updated!" });

      if (response.data?.user?.profileImage) {
        await updateNextAuthSession({
          user: { image: response.data.user.profileImage },
        });
      }
    } catch (err: any) {
      setUiMessage({
        type: "error",
        text: err?.data?.message || err.error || "Failed to upload image.",
      });
      setImagePreview(userProfile?.profileImage || null); // Revert on failure
      URL.revokeObjectURL(temporaryPreview);
    }
  };

  const onTextUpdate: SubmitHandler<UpdateProfileFormValues> = async (data) => {
    setUiMessage(null);
    const formData = new FormData();
    if (data.username !== userProfile?.username)
      formData.append("username", data.username || "");
    if (data.displayName !== userProfile?.displayName)
      formData.append("displayName", data.displayName || "");
    if (data.bio !== userProfile?.bio) formData.append("bio", data.bio || "");

    if ([...formData.entries()].length === 0) {
      setUiMessage({ type: "info", text: "No changes to save." });
      return;
    }

    try {
      const response = await updateMyProfile(formData).unwrap();
      setUiMessage({
        type: "success",
        text: response.message || "Profile details updated!",
      });

      const updatedUser = response.data?.user;
      if (updatedUser) {
        await updateNextAuthSession({
          user: {
            name: updatedUser.displayName,
            username: updatedUser.username,
          },
        });
        await updateNextAuthSession({
          user: {
            name: updatedUser.displayName,
            username: updatedUser.username,
          },
        });
      }
    } catch (err: any) {
      setUiMessage({
        type: "error",
        text: err?.data?.message || "Failed to update details.",
      });
    }
  };

  const handleDelete = async () => {
    await deleteMyAccount()
      .unwrap()
      .then(() => {
        signOut({ callbackUrl: "/auth/login?message=AccountDeleted" });
      })
      .catch((err) => {
        setUiMessage({
          type: "error",
          text: err?.data?.message || "Failed to delete account.",
        });
      });
  };

  const handleLogout = async () => signOut({ callbackUrl: "/auth/login" });

  useFocusOnError(errors, setFocus);

  if (
    sessionStatus === "loading" ||
    (sessionStatus === "authenticated" && isFetchingProfile && !userProfile)
  ) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  if (sessionStatus === "unauthenticated") {
    return (
      <Card className="w-full max-w-lg mx-auto mt-10">
        <CardHeader>
          <CardTitle className="text-center">Authentication Required</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            You must be logged in to view your profile.
          </p>
          <Button asChild>
            <Link href="/auth/login">
              <LogIn className="mr-2 h-4 w-4" />
              Log In
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  if (isProfileError) {
    return (
      <div className="container mx-auto max-w-3xl text-center py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Could not load your profile.</AlertDescription>
        </Alert>
      </div>
    );
  }
  if (!userProfile) return null;

  const isPageBusy =
    isUpdatingProfile ||
    isDeletingAccount ||
    isSubmitting ||
    uploadState.isUploading;

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
      <div className="space-y-8">
        <Card className="bg-card shadow-lg border-border">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
              <div className="relative w-32 h-32 group shrink-0">
                <Image
                  key={imagePreview}
                  src={imagePreview || "/placeholder-user.jpg"}
                  alt={userProfile.displayName || "User Avatar"}
                  fill
                  sizes="(max-width: 640px) 8rem, 10rem" // <-- ADD THIS LINE
                  className={cn(
                    "rounded-full object-cover border-4 border-background shadow-md",
                    uploadState.isUploading && "opacity-50"
                  )}
                  priority
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => !isPageBusy && fileInputRef.current?.click()}
                  disabled={isPageBusy}
                  className="absolute bottom-1 right-1 z-10 bg-card/80 hover:bg-card rounded-full w-10 h-10"
                  aria-label="Change profile picture"
                >
                  <Camera className="w-5 h-5" />
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isPageBusy}
                />
              </div>
              <div className="text-center sm:text-left flex-grow">
                <h1 className="text-3xl font-bold">
                  {userProfile.displayName || userProfile.username}
                </h1>
                <p className="text-md text-muted-foreground">
                  @{userProfile.username}
                </p>
                <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start mt-2">
                  <Mail size={14} className="mr-1.5" />
                  {userProfile.email}
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  {userProfile.bio || "No bio provided."}
                </p>
              </div>
            </div>
            {uploadState.isUploading && (
              <div className="w-full text-center pt-4">
                <Progress value={uploadState.progress} className="w-full h-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  Uploading... {uploadState.progress}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card shadow-lg border-border">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>
              Update your public profile information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {uiMessage && (
              <Alert
                variant={uiMessage.type === "error" ? "destructive" : "default"}
                className={cn(
                  "mb-6",
                  uiMessage.type === "success" &&
                    "border-green-500/50 text-green-700"
                )}
              >
                {uiMessage.type === "success" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Info className="h-4 w-4" />
                )}
                <AlertDescription>{uiMessage.text}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onTextUpdate)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    {...register("username")}
                    disabled={isPageBusy}
                  />
                  {errors.username && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.username.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    {...register("displayName")}
                    disabled={isPageBusy}
                  />
                  {errors.displayName && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.displayName.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  {...register("bio")}
                  placeholder="Tell us a little about yourself..."
                  disabled={isPageBusy}
                  className="min-h-[120px]"
                />
                {errors.bio && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.bio.message}
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isPageBusy || !isDirty}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isPageBusy}
                  onClick={() =>
                    reset({
                      username: userProfile.username || "",
                      displayName: userProfile.displayName || "",
                      bio: userProfile.bio || "",
                    })
                  }
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-lg border-border">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center p-4 border border-dashed rounded-lg">
              <div>
                <h4 className="font-medium">Log Out</h4>
                <p className="text-sm text-muted-foreground">
                  End your current session.
                </p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full mt-2 sm:mt-0 sm:w-auto"
                disabled={isPageBusy}
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center p-4 border border-dashed rounded-lg border-destructive bg-destructive/5">
              <div>
                <h4 className="font-medium text-destructive">Delete Account</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account. This is irreversible.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={isPageBusy}
                    className="w-full mt-2 sm:mt-0 sm:w-auto"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete My Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove all your data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeletingAccount}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isDeletingAccount && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Yes, Delete My Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
