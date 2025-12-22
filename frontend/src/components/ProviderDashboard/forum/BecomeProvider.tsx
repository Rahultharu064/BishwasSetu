import { useState, type MouseEvent, type ChangeEvent } from "react";
import { becomeProvider } from "../../../services/providerService";
import toast from "react-hot-toast";
import Card from "../../ui/Card";
import Input from "../../../components/ui/Input";
import Textarea from "../../../components/ui/Textarea";
import Button from "../../../components/ui/Button";

export default function BecomeProvider() {
    const [form, setForm] = useState({
        legalName: "",
        experienceYears: "",
        bio: "",
        serviceArea: "",
        availability: "",
        price: "",
        duration: ""
    });

    const submit = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            await becomeProvider(form);
            toast.success("You are now a provider!");
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Error");
        }
    };

    return (
        <Card>
            <h2 className="text-xl font-semibold mb-4">Become a Provider</h2>

            <Input placeholder="Legal Name" value={form.legalName} onChange={e => setForm({ ...form, legalName: e.target.value })} />
            <Input placeholder="Experience Years" value={form.experienceYears} className="mt-2" onChange={e => setForm({ ...form, experienceYears: e.target.value })} />
            <Textarea placeholder="Bio" className="mt-2" onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, bio: e.target.value })} />
            <Input placeholder="Service Area" value={form.serviceArea} className="mt-2" onChange={e => setForm({ ...form, serviceArea: e.target.value })} />
            <Input placeholder="Availability" value={form.availability} className="mt-2" onChange={e => setForm({ ...form, availability: e.target.value })} />
            <Input placeholder="Price (Base Rate)" value={form.price} type="number" className="mt-2" onChange={e => setForm({ ...form, price: e.target.value })} />
            <Input placeholder="Duration (Base)" value={form.duration} className="mt-2" onChange={e => setForm({ ...form, duration: e.target.value })} />

            <Button className="mt-4 w-full" onClick={submit}>
                Submit
            </Button>
        </Card>
    );
}
