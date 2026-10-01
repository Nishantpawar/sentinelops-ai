import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { IncidentService } from '../services/incident.service';
import { IncidentRepository } from '../repositories/incident.repository';

export class IncidentController {
  static async create(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const incident = await IncidentService.createIncident(req.user, req.body);
      res.status(201).json({ success: true, data: incident, message: 'Incident created successfully' });
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const incidents = await IncidentRepository.findAll();
      res.json({ success: true, data: incidents, message: 'Incidents retrieved successfully' });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const incident = await IncidentRepository.findById(req.params.id);
      if (!incident) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Incident not found' } });
      }
      res.json({ success: true, data: incident, message: 'Incident details retrieved' });
    } catch (err) {
      next(err);
    }
  }

  static async assign(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const { technicianId, reason, assignmentType } = req.body;
      const incident = await IncidentService.assignTechnician(
        req.user,
        req.params.id,
        technicianId,
        reason || 'Supervisor assignment',
        assignmentType || 'MANUAL'
      );
      res.json({ success: true, data: incident, message: 'Technician assigned successfully' });
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const { status, message } = req.body;
      const incident = await IncidentService.updateStatus(req.user, req.params.id, status, message || 'Status updated');
      res.json({ success: true, data: incident, message: `Incident status updated to ${status}` });
    } catch (err) {
      next(err);
    }
  }

  static async getAssignments(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const assignments = await IncidentRepository.getAssignments(req.params.id);
      res.json({ success: true, data: assignments, message: 'Assignments history retrieved' });
    } catch (err) {
      next(err);
    }
  }

  static async getUpdates(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const updates = await IncidentRepository.getUpdates(req.params.id);
      res.json({ success: true, data: updates, message: 'Incident updates retrieved' });
    } catch (err) {
      next(err);
    }
  }

  static async postUpdate(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const { message, update_type, language } = req.body;
      const update = await IncidentRepository.addUpdate({
        incident_id: req.params.id,
        user_id: req.user.id,
        update_type: update_type || 'NOTE',
        message,
        language: language || req.user.preferred_language || 'en',
      });
      res.status(201).json({ success: true, data: update, message: 'Update posted successfully' });
    } catch (err) {
      next(err);
    }
  }

  static async getMessages(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const messages = await IncidentRepository.getMessages(req.params.id);
      res.json({ success: true, data: messages, message: 'Incident messages retrieved' });
    } catch (err) {
      next(err);
    }
  }

  static async postMessage(req: AuthenticatedRequest, res: Response, next: any) {
    try {
      const { message, recipient_id, language } = req.body;
      const msg = await IncidentRepository.addMessage({
        incident_id: req.params.id,
        sender_id: req.user.id,
        recipient_id: recipient_id || null,
        message,
        language: language || req.user.preferred_language || 'en',
      });
      res.status(201).json({ success: true, data: msg, message: 'Message sent successfully' });
    } catch (err) {
      next(err);
    }
  }
}
